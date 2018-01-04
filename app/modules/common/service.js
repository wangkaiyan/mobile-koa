var fs = require('fs');
var support = require('../../support');
var request = support.request;
var request2 = support.request2;
var request3 = require('request');
var config = require('../../config');
var fs = require('fs');


exports.uploadImage = function (name,loadFile) {
  var rs = fs.createReadStream(loadFile);

  var formData = {
    file: fs.createReadStream(loadFile)
  };
  return new Promise(function (resolve, reject) {
    request3.post({
      // url: 'http://localhost:8080/s5x-web/upload/imageUpload',
      url: 'http://localhost:8181/s5x-web/upload/imageUpload',
      formData: formData
    }, function optionalCallback(err, httpResponse, body) {
      if (err) {
         console.error('upload failed:', err);
        return resolve(body);
      }
      console.log('Upload successful!  Server responded with:', body);
      return resolve(JSON.parse(body).data.entity);
    });
  })

  // rs.pipe(request3.post('http://localhost:8080/s5x-web/upload/imageUpload'))

};


