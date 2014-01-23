JavaScript-MinifyJpeg
=====================

To minify JPEG images without losing EXIF.

Demo
--------
  <http://blog-imgs-51-origin.fc2.com/e/l/i/elicon/20130125115221442.html>

How to Use
--------
    <input type="file" id="files" name="files[]" multiple />
    <script source="/js/jpg.js" />
    <script source="/js/MinifyJpeg.js" />
    ******************************************
    function handleFileSelect(evt) {
        var files = evt.target.files;

        for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();
            reader.onloadend = (function(theFile)            {
                return function(e)                {
                    var minified = MinifyJpeg.minify(e.target.result, 1280);

                    // add image to body
                    var img = new Image();
                    img.src = "data:image/jpeg;base64," + MinifyJpeg.encode64(minified);
                    $('body').append(img);
                }
            })(f);

            reader.readAsDataURL(f);
        }
    }

Depend on
--------
  <https://github.com/notmasteryet/jpgjs>