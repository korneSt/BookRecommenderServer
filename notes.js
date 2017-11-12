
//dodawanie książki do tabeli UserBookRating
Book.findOrCreate({
where: { title: 'test1' }, defaults: {
  author: 'test',
  title: 'test'
}
}).spread(function (b, createdBook) {
  console.log(b.get({
    plain: true
  }))
  User.findOne({where: {id: 1}}).then( (user) => {
    user.addBook(b);
  });
})