const Class = require("../Models/class.model");
const Product = require("../Models/product.model");
const User = require("../Models/user.model");
module.exports = {
    LoadAllClasses: async(req, res, idUser) => {
        Class.findOne({ iduser: idUser }).lean()
            .then(async(MyClass) => {
                let listclass = await Promise.all(MyClass.idcourses.map(async idcourse => {
                    let course = await Product.findById(idcourse).lean();
                    return (course);
                })); //
                res.render('./Client/myclass', {
                    layout: 'client',
                    class: listclass,
                    Page: "Classes",
                    User: req.user,
                });
            })
            .catch((err) => console.log(err));

    },

    /*LoadIdClasses : async (req, res, id) => {
        Product.findById(id)
          .lean()
          .then((classList) => {
                    res.render("./Client/myclass-detail", {
                      Class: classList,
                      Page: "Classes",
                      User: req.user,
                    });
            })
            .catch((err) => console.log(err));
    },*/

    LoadIdClasses: async(req, res, id) => {
        Class.findOne({ iduser: req.user._id }).lean()
            .then(async(classList) => {
                //console.log(courseList.idproducts)
                //console.log(xacthuc(courseList,id))
                if (xacthuc(classList, id) == 1) {
                    Product.findById(id)
                        .lean()
                        .then(async(classList) => {
                            if (Array.isArray(classList.comment)) {
                                let listUserComment = await Promise.all(classList.comment.map(async comment => {
                                    let uscomment = await User.findById(comment.iduser).lean();
                                    return (uscomment);
                                }));
                                // productList.comment.forEach(({iduser}) => {
                                // console.log(iduser)
                                // 

                                var UserComment = [{
                                    nameduser: {},
                                    com: {},
                                }]
                                var UserComment1 = {
                                    nameduser: {},
                                    com: {},
                                }
                                for (var i = 0; i < listUserComment.length; i++) {
                                    UserComment1.nameduser = (listUserComment[i].displayname);
                                    UserComment1.com = (classList.comment[i].com);
                                    //console.log(UserComment1.nameduser);
                                    //console.log(UserComment1.com);
                                    UserComment[i] = (UserComment1);
                                    var UserComment1 = {
                                        nameduser: {},
                                        com: {},
                                    }
                                }
                            }
                            res.render("./Client/myclass-detail", {
                                layout: 'client',
                                Product: classList,
                                User: req.user,
                                Page: "Classes",
                                UserComment: UserComment,
                            });


                            //.catch((err) => console.log(err));
                        })
                } else {
                    res.render("./error", { layout: '' });
                }
            })
            // .catch((err) => console.log(err));
    },

    addComment: async(req, res, idUs, idPr, cmt) => //id: id c???a cart, v?? m???i user c?? 1 cart n??n l???y id cart. Th??m 1 gi?? tr??? v??o h??m l?? cmt ????? l??u gi?? tr??? comment
        { //t???o 1 object c?? iduser:id, cmt: cmt
            var ObjectComment = {
                    iduser: idUs,
                    com: cmt.comment,
                }
                //thay v?? t??m ?????n gi??? h??ng th?? t??m ?????n product c?? gi?? tr??? id:idpr. r???i push c??i object v???a t???o v??o comment. l??m xong r???i x??a ph???n ch?? th??ch n??y ??i.oke 
            Product.findOne({ _id: idPr }).lean() //t??m ?????n gi??? h??ng c???a ng?????i c?? id = id
                .then((product) => { //k???t qu??? t??m ???????c g??n v??o cart
                    if (Array.isArray(product.comment)) {
                        product.comment.push(ObjectComment);
                    } else {
                        product.comment = [ObjectComment];
                    }
                    //v?? idproducts l?? array danh s??ch idproduct n??n d??ng h??m push ????? th??m v??o cu???i.
                    var newComment = product.comment;
                    Product.findOneAndUpdate({ _id: idPr }, { comment: newComment }, function(err, result) {})
                })
                .catch((err) => console.log(err))
        },



    AddCourseToMyClass: async(iduser, idcourse) => //id: id c???a user, v?? m???i user c?? 1 myclass n??n l???y id class
        {
            Class.findOne({ iduser: iduser }).lean()
                .then(async(Class) => {
                    Class.idcourses.push(idcourse);
                })
                .catch((err) => console.log(err))
        },

    /*addclass: async (id, idcourse)=>{
        const newClass = Class.findById(id).lean();
        if(newClass != null){
        Class.findOneAndUpdate(id, {idcourses: idcourse}, function(err, result) {})
                            .catch((err) => console.log(err));
        }
        else {
        newClass = new Class({
                 iduser: id,
                 idcourses:idcourse,
             });
             newClass
                 .save()
                 .catch((err) => console.log(err)); 
        }        
     },*/

    addcourse: async(req, res, idUser, course) => {
        const newProduct = new Product({
            name: course.name,
            category: {
                name: course.category
            },
            descriptionshort: course.descriptionshort,
            descriptionfull: course.descriptionfull,
            author: {
                id: idUser,
                name: req.user.displayname,
            },
            price: course.price,
            pathImg: course.pathImg,
            video: course.video,
            discount: course.discount,
            sold: 0,
            rating: 0
        });
        newProduct
            .save()
            .catch((err) => console.log(err))
        var idpr = String(newProduct._id);
        let newClass = await Class.findOne({iduser:idUser}).lean();
        if(newClass != null){
            newClass.idcourses.push(idpr);
            Class.findOneAndUpdate({iduser:idUser}, {idcourses:newClass.idcourses}, function(err, result) {})
            .catch((err) => console.log(err));
        }
        else {
        newClass = new Class({
                 iduser: id,
                 idcourses:idpr,
             });
             newClass
                 .save()
                 .catch((err) => console.log(err)); 
        }
    },
    addlesson: async(req, res, idcourse, lesson_path) => {
        Product.findById(idcourse)
            .then((course) => {
                course.video.push(lesson_path);
                Product.findOneAndUpdate({ _id: idcourse }, { video: course.video }, function(err, result) {})
                    .catch((err) => console.log(err))
            })
            .catch((err) => console.log(err))

    },

};

function xacthuc(classList, id) {
    var maxacthuc = 0
    for (var i = 0; i < classList.idcourses.length; i++) {
        if (classList.idcourses[i] == id) {
            maxacthuc = 1
        }
    }
    return maxacthuc;
}