"use strict"

/**
 * Module dependencies.
 */
require("dotenv").config()
const express = require("express")
const hash = require("pbkdf2-password")()
const jsonServer = require("json-server")
const path = require("path")
const cors = require("cors")
const AWS = require("aws-sdk")
const { randomUUID } = require("crypto")
const multer = require("multer")
const cookieSession = require("cookie-session")
const fs = require("fs")
const md5 = require("md5")
const _ = require("lodash")

const low = require("lowdb")
const FileSync = require("lowdb/adapters/FileSync")

const oneDay = 1000 * 60 * 60 * 24
const dbPath = path.resolve(__dirname, "db.json")

const S3_BUCKET = process.env.S3_BUCKET
const REGION = process.env.S3_REGION

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const myBucket = new AWS.S3({
    params: { Bucket: S3_BUCKET },
    region: REGION,
})

if (process.env.NODE_ENV === "production") {
    const params = {
        Bucket: S3_BUCKET,
        Key: "db.json",
    }
    const readStream = myBucket.getObject(params).createReadStream()
    const writeStream = fs.createWriteStream(dbPath)
    readStream.pipe(writeStream).on("finish", () => {
        startApp()
    })
} else {
    startApp()
}

const watchDb = () => {
    let md5Previous = md5(fs.readFileSync(dbPath))
    let fsWait = false

    fs.watch(dbPath, (event, filename) => {
        if (filename) {
            if (fsWait) return
            fsWait = setTimeout(() => {
                fsWait = false
            }, 100)
            const dbFile = fs.readFileSync(dbPath)
            const md5Current = md5(dbFile)
            if (md5Current === md5Previous) {
                return
            }
            md5Previous = md5Current
            const params = {
                Body: dbFile,
                Bucket: S3_BUCKET,
                Key: "db.json",
            }
            myBucket.putObject(params, (err, data) => {
                if (err) {
                    console.log("Error saving file:", err)
                }
            })
            console.log(`${filename} file Changed`)
        }
    })
}

function startApp() {
    if (process.env.NODE_ENV === "production") {
        watchDb()
    }

    const db = low(new FileSync(dbPath))
    const server = jsonServer.create()
    const router = jsonServer.router(db)
    const middlewares = jsonServer.defaults()

    server.use(
        cors({
            origin: ["http://localhost:3000", "http://localhost:3001", process.env.REQUEST_ORIGIN],
            credentials: true,
        })
    )
    server.use(express.json())
    server.use(express.urlencoded({ extended: true }))
    server.use(
        cookieSession({
            maxAge: oneDay,
            keys: [process.env.SESSION_SECRET],
            sameSite: "none",
            secureProxy: true,
        })
    )
    server.use(middlewares)

    server.use((req, res, next) => {
        if (isAuthorized(req)) {
            next()
        } else {
            res.sendStatus(401)
        }
    })

    const isAuthorized = (req) => {
        const resource = req.path.substring(req.path.lastIndexOf("/") + 1)
        if (/recipe/.test(resource)) {
            switch (req.method) {
                case "POST":
                case "PUT":
                case "PATCH":
                    if (!req.session || !req.session.user) {
                        return false
                    }
                    return req.session.user === req.body.authorId
                case "DELETE":
                    if (!req.session || !req.session.user) {
                        return false
                    }
                    const resource = req.path.substring(req.path.lastIndexOf("/") + 1)
                    const recipe = db
                        .get("recipe")
                        .find((r) => r.id === resource)
                        .value()
                    return recipe.authorId === req.session.user
                default:
                    return true
            }
        }
        return true
    }

    function authenticate(email, pass, fn) {
        if (!module.parent) console.log("authenticating %s:%s", email)
        const user = db
            .get("user")
            .find((u) => u.email === email)
            .value()
        // query the db for the given username
        if (!user) return fn(null, null)
        // apply the same algorithm to the POSTed password, applying
        // the hash against the pass / salt, if there is a match we
        // found the user
        hash({ password: pass, salt: user.salt }, (err, pass, salt, hash) => {
            if (err) return fn(err)
            if (hash === user.password) return fn(null, user)
            fn(null, null)
        })
    }

    server.post("/signup", (req, res, next) => {
        if (!req.body) {
            return res.status(400).send()
        }
        const { username, email, password } = req.body.user
        if ((!username, !email, !password)) {
            return res.status(400).send()
        }
        if (
            db
                .get("user")
                .find((u) => u.username === username)
                .value()
        ) {
            return res.status(403).send("Duplicate username")
        }
        if (
            db
                .get("user")
                .find((u) => u.email === email)
                .value()
        ) {
            return res.status(403).send("Duplicate email")
        }
        hash({ password }, (err, pass, salt, hash) => {
            if (err) throw err
            const user = {
                username,
                email,
                password: hash,
                salt,
            }
            db.get("user").push(user).write()
            req.session.user = user.username
            const sendFn = () => {
                const resPayload = { user: { username, email } }
                res.jsonp(resPayload)
            }
            if (req.body.recipe) {
                req.url = "/recipe"
                req.method = "POST"
                req.body = req.body.recipe
                req.body.authorId = user.username
                const newRes = _.cloneDeep(res)
                newRes.send = sendFn
                router.handle(req, newRes, next)
            } else {
                sendFn()
            }
        })
    })

    server.get("/signout", (req, res) => {
        req.session = null
        res.redirect("/")
    })

    server.post("/signin", (req, res, next) => {
        authenticate(req.body.email, req.body.password, (err, user) => {
            if (err) return next(err)
            if (user) {
                req.session.user = user.username
                res.jsonp({ user: { username: user.username, email: user.email } })
            } else {
                req.session.error = "Authentication failed, please check your username and password."
                res.status(403).send()
            }
        })
    })

    server.post("/image-upload", multer().single("image"), (req, res, next) => {
        const fileName = randomUUID()
        const params = {
            Body: req.file.buffer,
            Bucket: S3_BUCKET,
            Key: `uploads/${fileName}`,
        }

        myBucket.putObject(params, (err, data) => {
            if (err) {
                res.status(err.code).send(err.message)
            }
            const url = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/uploads/${fileName}`
            res.jsonp({ url })
        })
    })

    server.use(router)

    /* istanbul ignore next */
    if (!module.parent) {
        const port = process.env.PORT || 3001
        server.listen(port)
        console.log(`Express started on port ${port}`)
    }
}
