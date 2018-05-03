'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const { MONGODB_URI } = require('../config');

const {Note} = require('../models/note');

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const searchTerm = 'cats';
//     let filter = {};

//     if (searchTerm) {
//       const re = new RegExp(searchTerm, 'i');
//       filter.title = { $regex: re };
//       filter.content = {$regex: re};
//     }

//     return Note.find({$or: [{title: filter.title}, {content: filter.content}]})
//       .sort('created')
//       .then(results => {
//         console.log(results);
//       })
//       .catch(console.error);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//       .then(() => {
//         console.info('Disconnected');
//       });
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

//find by id

mongoose.connect(MONGODB_URI)
  .then(() => {
    const id = '000000000000000000000005';

    return Note.find({_id: id})
      .then(results => {
        console.log(results);
      })
      .catch(console.error);
  })
  .then(() => {
    return mongoose.disconnect()
      .then(() => {
        console.info('Disconnected');
      });
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

// note.create

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const obj = {
//       title:'',
//       content: 'test'
//     };

//     return Note.create(obj)
//       .then(results => {
//         console.log(results);
//       })
//       .catch(console.error);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//       .then(() => {
//         console.info('Disconnected');
//       });
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

//find by id and update

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const id = '000000000000000000000005';
//     const obj = {
//       title: 'hello',
//       content: 'hello'
//     };
//     return Note.findByIdAndUpdate(id, obj, {new: true})
//       .then(results => {
//         console.log(results);
//       })
//       .catch(console.error);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//       .then(() => {
//         console.info('Disconnected');
//       });
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

//delete by by id 

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const id = '000000000000000000000003';

//     return Note.findByIdAndRemove(id, {select: 'title'})
//       .then((result) => {
//         console.log(`${result} deleted`);
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   })
//   .then(() => {
//     return mongoose.disconnect()
//       .then(() => {
//         console.info('Disconnected');
//       });
//   })
//   .catch(err => {
//     console.error(`ERRORL: ${err.message}`);
//     console.error(err);
//   });

