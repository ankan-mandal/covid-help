const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
var cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(cookieParser());

//Mongoose Connection
mongoose.connect("mongodb+srv://admin-mandal:ankan-123456@cluster0.qvidy.mongodb.net/covid?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});
const Data = require("./models/database");

app.get("/", (req, res) => {
    let {
        page,
        size
    } = req.query;

    if (!page) {
        page = 1;
    }

    if (!size) {
        size = 24;
    }

    const limit = parseInt(size);
    const skip = (page - 1) * size;
    const nextpage = parseInt(page) + 1;

    Data.find({
            who: "supplier"
        },
        null, {
            limit: limit,
            skip: skip,
            sort: {
                date: -1
            }
        },
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.render("index", {
                    result: result,
                    page: nextpage
                });
            }
        }
    );
});

app.get("/request", (req, res) => {
    let {
        page,
        size
    } = req.query;

    if (!page) {
        page = 1;
    }

    if (!size) {
        size = 24;
    }

    const limit = parseInt(size);
    const skip = (page - 1) * size;
    const nextpage = parseInt(page) + 1;

    Data.find({
            who: "patient"
        },
        null, {
            limit: limit,
            skip: skip,
            sort: {
                date: -1
            }
        },
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.render("request", {
                    result: result,
                    page: nextpage
                });
            }
        }
    );
});

app.get("/post", (req, res) => {
    res.render("post");
});

app.post("/post", async (req, res) => {
    const name = req.body.name.toLowerCase(),
        requirement = req.body.requirement,
        detail = req.body.detail.toLowerCase(),
        city = req.body.city.toLowerCase(),
        state = req.body.state.toLowerCase(),
        phone = req.body.phone,
        who = req.body.who.toLowerCase();

    if (!req.cookies.uuid) {
        const uuid = await uuidv4();

        const post = new Data({
            name: name,
            requirement: requirement,
            detail: detail,
            city: city,
            state: state,
            phone: phone,
            who: who,
            uuid: uuid,
        });

        post.save(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log("Saved Successful...");
                res.cookie("uuid", uuid, {
                    maxAge: 365 * 24 * 60 * 60 * 1000
                });
                if(result.who === 'supplier'){
                    res.redirect("/");
                } else {
                    res.redirect("/request");
                }
                
            }
        });
    } else {
        const post = new Data({
            name: name,
            requirement: requirement,
            detail: detail,
            city: city,
            state: state,
            phone: phone,
            who: who,
            uuid: req.cookies.uuid,
        });

        post.save(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                if(result.who === 'supplier'){
                    res.redirect("/");
                } else {
                    res.redirect("/request");
                }
            }
        });
    }
});

app.get("/search", (req, res) => {
    const city = req.query.city.toLowerCase();
    const requirement = req.query.requirement.toLowerCase();

    const regex = new RegExp(escapeRegExp(city), "gi");

    Data.find({
            city: regex,
            requirement: requirement,
            who: "supplier"
        },
        null, {
            limit: 50,
            sort: {
                date: -1
            }
        },
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.render("search", {
                    result: result,
                    page: 1
                });
            }
        }
    );
});

app.post("/search", (req, res) => {
    const city = req.body.city;
    const requirement = req.body.requirement;

    res.redirect(`/search?city=${city}&requirement=${requirement}`);
});

app.get("/request/search", (req, res) => {
    const city = req.query.city.toLowerCase();
    const requirement = req.query.requirement.toLowerCase();

    const regex = new RegExp(escapeRegExp(city), "gi");

    Data.find({
            city: regex,
            requirement: requirement,
            who: "patient"
        },
        null, {
            limit: 50,
            sort: {
                date: -1
            }
        },
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.render("search", {
                    result: result,
                    page: 1
                });
            }
        }
    );
});

app.post("/request/search", (req, res) => {
    const city = req.body.city;
    const requirement = req.body.requirement;

    res.redirect(`/request/search?city=${city}&requirement=${requirement}`);
});

app.get("/user", (req, res) => {
    uuid = req.cookies.uuid;

    if (!uuid) {
        uuid = 0;
    }

    Data.find({
        uuid: uuid
    }, null, {
        sort: {
            date: -1
        }
    }, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.render("user", {
                result: result
            });
        }
    });
});

app.post("/delete/:id", (req, res) => {
    const id = req.params.id;

    Data.deleteOne({
        _id: id
    }, function (err) {
        if (err) return handleError(err);
        res.redirect("/user");
    });
});

app.listen(4000, () => {
    console.log("Server is running in PORT 4000...");
});

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}