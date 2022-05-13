"use strict"

/**
 * Module dependencies.
 */

const express = require("express")
const hash = require("pbkdf2-password")()
const session = require("express-session")
const jsonServer = require("json-server")
const server = jsonServer.create()
const router = jsonServer.router("db.json")
const middlewares = jsonServer.defaults()
const fs = require("fs")
const cors = require("cors")
const AWS = require("aws-sdk")
const { randomUUID } = require("crypto")
const multer = require("multer")

const oneDay = 1000 * 60 * 60 * 24

const S3_BUCKET = ***REMOVED***
const REGION = ***REMOVED***

AWS.config.update({
    accessKeyId: ***REMOVED***,
    secretAccessKey: ***REMOVED***,
})

const myBucket = new AWS.S3({
    params: { Bucket: S3_BUCKET },
    region: REGION,
})

// middleware

server.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:3001"],
        credentials: true,
    })
)
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(
    session({
        resave: false, // don't save session if unmodified
        saveUninitialized: false, // don't create session until something stored
        secret: "shhhh, very secret",
        cookie: { maxAge: oneDay },
    })
)
server.use(middlewares)

function authenticate(email, pass, fn) {
    const rawdata = fs.readFileSync("db.json")
    const db = JSON.parse(rawdata)

    if (!module.parent) console.log("authenticating %s:%s", email, pass)
    const user = db.user.find((u) => u.email === email)
    // query the db for the given username
    if (!user) return fn(null, null)
    // apply the same algorithm to the POSTed password, applying
    // the hash against the pass / salt, if there is a match we
    // found the user
    hash({ password: pass, salt: user.salt }, function (err, pass, salt, hash) {
        if (err) return fn(err)
        if (hash === user.password) return fn(null, user)
        fn(null, null)
    })
}

function restrict(req, res, next) {
    if (req.session.user) {
        next()
    } else {
        req.session.error = "Access denied!"
        res.redirect("/signin")
    }
}

server.post("/signup", function (req, res) {
    if (!req.body) {
        return res.status(400).send()
    }
    const { username, email, password } = req.body
    if ((!username, !email, !password)) {
        return res.status(400).send()
    }
    const rawdata = fs.readFileSync("db.json")
    const db = JSON.parse(rawdata)
    if (db.user.find((u) => u.username === username)) {
        return res.status(403).send("Duplicate username")
    }
    if (db.user.find((u) => u.email === email)) {
        return res.status(403).send("Duplicate email")
    }
    hash({ password }, function (err, pass, salt, hash) {
        if (err) throw err
        const user = {
            username,
            email,
            password: hash,
            salt,
        }
        db.user.push(user)
        fs.writeFileSync("./db.json", JSON.stringify(db, null, 2))
        req.session.user = user
        req.session.success = "Authenticated as " + user.username
        const resPayload = { user: { username, email } }
        res.jsonp(resPayload)
    })
})

server.get("/signout", function (req, res) {
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function () {
        res.redirect("/")
    })
})

server.post("/signin", function (req, res, next) {
    authenticate(req.body.email, req.body.password, function (err, user) {
        if (err) return next(err)
        if (user) {
            // Regenerate session when signing in
            // to prevent fixation
            req.session.regenerate(function () {
                // Store the user's primary key
                // in the session store to be retrieved,
                // or in this case the entire user object
                req.session.user = user
                req.session.success = "Authenticated as " + user.id
                res.jsonp({ user: { username: user.id, email: user.email } })
            })
        } else {
            req.session.error = "Authentication failed, please check your username and password."
            res.status(403).send()
        }
    })
})

server.post("/image-upload", multer().single("image"), function (req, res, next) {
    const fileName = `${randomUUID()}-${req.file.originalname}`
    const params = {
        Body: req.file.buffer,
        Bucket: S3_BUCKET,
        Key: fileName,
    }

    myBucket.putObject(params, (err, data) => {
        if (err) {
            res.status(err.code).send(err.message)
        }
        const url = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${fileName}`
        res.jsonp({ url })
    })
})

server.use(router)

/* istanbul ignore next */
if (!module.parent) {
    server.listen(3001)
    console.log("Express started on port 3001")
}
