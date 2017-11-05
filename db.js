var Sequelize = require('sequelize');

import * as db from './config'
let sequelize = db.sequelize;
let User = sequelize.define('user', {
  username: Sequelize.STRING,
  password: Sequelize.STRING
});

let Book = sequelize.define('book', {
  title: Sequelize.STRING,
  author: Sequelize.STRING,
  isbn: Sequelize.STRING,
  rating: Sequelize.FLOAT,
  cover: Sequelize.STRING,
  recommended: Sequelize.BOOLEAN
  // userId: {
  //   type: Sequelize.INTEGER,

  //   references: {
  //     // This is a reference to another model
  //     model: User,

  //     // This is the column name of the referenced model
  //     key: 'id',

  //   }
  // }
});

let Recommendation = sequelize.define('recommendation', {
  recommendedBookId: {
    type: Sequelize.INTEGER,
    references: {
      model: Book,
      key: 'id'
    }
  },
  baseBookId: {
    type: Sequelize.INTEGER,
    references: {
      model: Book,
      key: 'id'
    }
  },
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  reasoning: Sequelize.STRING,
  rating: Sequelize.FLOAT
});

let Category = sequelize.define('category', {
  name: Sequelize.STRING
});

// let bookCategory = sequelize.define('book_category', {
//   bookId: {
//     type: Sequelize.INTEGER,
//     references: {
//       model: Book,
//       key: 'id'
//     }
//   },
//   categoryId: {
//     type: Sequelize.INTEGER,
//     references: {
//       model: Category,
//       key: 'id'
//     }
//   }
// })


Book.belongsToMany(Category, { through: 'BookCategory' })
Category.belongsToMany(Book, { through: 'BookCategory' })

Book.belongsToMany(User, {through: 'UserBook'});
User.belongsToMany(Book, {through: 'UserBook'});
// User.hasMany(Book);
// Book.belongsTo(User);

// Book.hasMany(Recommendation);
Recommendation.belongsTo(User);
Recommendation.belongsTo(Book, { as: 'baseBook', foreignKey: 'baseBookId' });
Recommendation.belongsTo(Book, { as: 'recommendedBook', foreignKey: 'recommendedBookId' });

export const addRecommendation = (options, response) => {
  let recommendedBooks = JSON.parse(response);
  let booksToCreate = [];
  recommendedBooks.recommendedItems.forEach(function (entry) {
    let rTemp = {
      recommendedBookId: entry.items[0].id,
      userId: options.qs.userId,
      rating: entry.rating,
      reasoning: entry.reasoning[0]
    };
    Recommendation.findOrCreate({ where: {} })
    booksToCreate.push(rTemp);
  });

  booksToCreate.forEach(function (e) {
    console.log(e);
  })

  let bookObj = {
    recommendedBookId: recommendedBooks
  }

  // console.log(response)
  // sequelize.sync().then(function () {
  //   Recommendation.create({
  //     recommendedBookId: 1,
  //     userId: 1,
  //     rating: 0.4,
  //     reasoning: 'Liked book 1'
  //   })
  // })
}

export const login = (req, res) => {  
  sequelize.sync().then(() => {
    console.log('body', req.body);
    User.findOne({
      where: {
        username: req.body.username,
        password: req.body.password
      }
    }).then((user) => {
      if (user !== null) {
        let id = user.get('id')
        
        res.status(200).send({userId: id})
      } else {
        res.sendStatus(304);
      }
    })
  })
}

export const addNewBook = (req, res) => {
  console.log(req.body);
  let book = {};
  sequelize.sync().then(() => {
  Book.findOrCreate({
    where: { title: req.body.title }, defaults: {
      author: req.body.author,
      title: req.body.title,
      rating: req.body.rating,
      cover: req.body.cover,
      recommended: req.body.recommended
    }
  })
  .spread(function (b, created) {
      console.log(b.get({
        plain: true
      }))
      Category.findOrCreate({
        where: { name: "Powiesc" }, defaults: {            
        name: 'Powiesc'
      }
      })
      .spread(function (c, created) {
        console.log(c.get({
          plain: true
        }))
        b.addCategories([c])
        res.sendStatus(200);
      })
    })
  })
}

export const addBook = (book) => {
  // sequelize.sync().then(() => {
  return Book
    .findOrCreate({
      where: { title: book.title }, defaults: {
        author: book.author,
        isnb: book.isbn,
        rating: book.rating,
        cover: book.cover
      }
    })
  // .spread(function (book, created) {
  //   console.log(book.get({
  //     plain: true
  //   }))
  //   console.log(created)
  // })
  // })
}

export const getBooksDB = (req, res) => {
  let mappedBooks = [];
  sequelize.sync().then(() => {
    Book.findAll().then((books) => {
      books.map((el) => {
        mappedBooks.push(el.get({
          plain: true
        }))
      });
      // res.send(books);
    }).then((books) => {
      console.log(mappedBooks.length);
      res.send(mappedBooks);
    })
  })

}

export const getUserBooks = (req, res) => {
  let mappedBooks = [];
  sequelize.sync().then(() => {
    Book.findAll({
      where: {
        userId: req.params.id
      }
    }).then((books) => {
      books.map((el) => {
        mappedBooks.push(el.get({
          plain: true
        }))
      });
      // res.send(books);
    }).then((books) => {
      console.log(mappedBooks.length);
      res.send(mappedBooks);
    })
  })
}

export const getBookById = (bookId) => {
  // sequelize.sync().then(function () {
    return Book.findOne({
        where: {
          id: bookId
        }
      }).then(function (book) {
        // console.log(book.get({
        //   plain: true
        // }));
        if(book !== null)
        return book.get({ plain: true });
      });
  // })
}

export const addUser = () => {
  sequelize.sync().then(function () {

    // User.create({
    //   username: 'kornel',
    //   password: 'kornel'
    // }).then(function (u) {
    //   Book.create({
    //     title: 'Diuna',
    //     author: 'Herbert',
    //     isbn: '12345',
    //     rating: '3',
    //     cover: 'http://asd.pl',
    //   }).then(function (b) {
    //     Category.create({
    //       name: 'Powiesc'
    //     }).then(function (c) {
    //       b.setUser(u);
    //       b.setCategories([c])
    //     })
    //   })
    // })
    // Book.create({
    //   title: 'Pan Tadeusz',
    //   author: 'Mickiewicz',
    //   isbn: '12345',
    //   rating: '1',
    //   cover: 'http://asd.pl'
    // })
    // Recommendation.create({
    //   recommendedBookId: 1,
    //   userId: 1,
    //   rating: 0.4,
    //   reasoning: 'Liked book 1'
    // })


    // let b = Book.create({
    //   title: 'Diuna',
    //   author: 'Herbert',
    //   isbn: '12345',
    //   rating: '3',
    //   cover: 'http://asd.pl',
    // })

    // let c = Category.create({
    //   name: 'Powiesc'
    // })
    // let c1 = Category.create({
    //   name: 'Naukowa'
    // })

    // let b1 = Book.create({
    //   title: 'Diuna1',
    //   author: 'Herbert',
    //   isbn: '12345',
    //   rating: '3',
    //   cover: 'http://asd.pl',
    //   User: {
    //     first_name: 'Mick',
    //     last_name: 'Broadstone'
    //   }
    // }, {
    //     include: [User]
    //   })
    // console.log(b);

    // b.setUser(u1);
    // b.setCategories([c, c1])

    // Recommendation.findAll({
    //   where: {
    //     userId: 1
    //   },
    //   include: [{
    //     model: User
    //   }, {
    //     model: Book,
    //     as: 'baseBook'
    //   }, {
    //     model: Book,
    //     as: 'recommendedBook'
    //   }]
    // }).then(function (recommendation) {
    //   console.log(recommendation)
    // });

    // Book.findOne({
    //   where: {
    //     id: 1
    //   }
    // }).then(function (book) {
    //   console.log(book);

    //   User.findOne({
    //     where: {
    //       id: 1
    //     }
    //   }).then(function (user) {
    //     book.setUser(user).then(function () {
    //       console.log('dodano');

    //     })
    //   });

    // });


    // b.setUser(u1)
    // b1.setUser(u1)
    // b.setUser([u1]).then(function () {
    //   console.log('ok');
    // })

    // return User.create({
    //   username: 'janedoe',
    //   password: 'asdsd'
    // });
  }).then(function () {
    // console.log(jane.get({
    //   plain: true
    // }));
    console.log('ok1');
  });
}




