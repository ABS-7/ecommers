async function show(req, res) {
    console.log("in product controller");
    return res.send("in product controller");
}

async function add(req, res) {
    // console.log(req.body);
    // console.log(req.file);
    // try{
    //     const add
    // }
    // res.send("in product controller");
}

module.exports = {
    show,
    add
}