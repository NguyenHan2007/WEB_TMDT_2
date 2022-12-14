const Course = require("../Models/course.model");
const Product = require("../Models/product.model");
const User = require("../Models/user.model");
module.exports = {
  LoadAllCourses: async (req, res, idUser) => {
    Course.findOne({ iduser: idUser }).lean()
      .then(async (MyCourse) => {
        let listproduct = await Promise.all(MyCourse.idproducts.map(async idproduct => {
          let product = await Product.findById(idproduct).lean();
          return (product);
        }));
        //console.log(MyCourse);
        //console.log(listproduct);
        res.render('./Client/mycourse', {
          layout: 'client',
          list: listproduct,
          User: req.user,
          Page: "Courses",
        });
      })
      .catch((err) => console.log(err));
  },
  LoadIdCourses: async (req, res, id) => {
    Course.findOne({ iduser: req.user._id }).lean()
      .then(async (courseList) => {
        //console.log(courseList.idproducts)
        //console.log(xacthuc(courseList,id))
        if (xacthuc(courseList, id) == 1) {
          Product.findById(id)
            .lean()
            .then(async (productList) => {
              if (Array.isArray(productList.comment)) {
                let listUserComment = await Promise.all(productList.comment.map(async comment => {
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
                  UserComment1.com = (productList.comment[i].com);
                  //console.log(UserComment1.nameduser);
                  //console.log(UserComment1.com);
                  UserComment[i] = (UserComment1);
                  var UserComment1 = {
                    nameduser: {},
                    com: {},
                  }
                }
              }
              res.render("./Client/mycourse-detail", {
                layout: 'client',
                Product: productList,
                User: req.user,
                Page: "Courses",
                UserComment: UserComment,
              });


              //.catch((err) => console.log(err));
            })
        }
        else {
          res.render("./error", { layout: '' });
        }
      })
    // .catch((err) => console.log(err));
  },
  addComment: async (req, res, idUs, idPr, cmt) =>//id: id c???a cart, v?? m???i user c?? 1 cart n??n l???y id cart. Th??m 1 gi?? tr??? v??o h??m l?? cmt ????? l??u gi?? tr??? comment
  {//t???o 1 object c?? iduser:id, cmt: cmt
    var ObjectComment = {
      iduser: idUs,
      com: cmt.comment,
    }
    //thay v?? t??m ?????n gi??? h??ng th?? t??m ?????n product c?? gi?? tr??? id:idpr. r???i push c??i object v???a t???o v??o comment. l??m xong r???i x??a ph???n ch?? th??ch n??y ??i.oke 
    Product.findOne({ _id: idPr }).lean()//t??m ?????n gi??? h??ng c???a ng?????i c?? id = id
      .then((product) => {//k???t qu??? t??m ???????c g??n v??o cart
        if (Array.isArray(product.comment)) {
          product.comment.push(ObjectComment);
        }
        else {
          product.comment = [ObjectComment];
        }
        //v?? idproducts l?? array danh s??ch idproduct n??n d??ng h??m push ????? th??m v??o cu???i.
        var newComment = product.comment;
        Product.findOneAndUpdate({ _id: idPr }, { comment: newComment }, function (err, result) { })
      })
      .catch((err) => console.log(err))
  }
  // loadVideo: async (req, res,id,sttvideo) =>
  // {

  // }
};
function xacthuc(courseList, id) {
  var maxacthuc = 0
  for (var i = 0; i < courseList.idproducts.length; i++) {
    if (courseList.idproducts[i] == id) {
      maxacthuc = 1
    }
  }
  return maxacthuc;
}
