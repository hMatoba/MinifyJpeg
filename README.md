JavaScript-MinifyJpeg
=====================

To minify JPEG images without losing EXIF.

Demo
--------
  <http://blog-imgs-51-origin.fc2.com/e/l/i/elicon/20130125115221442.html>

How to Use
_________
    <script source="/js/jpg.js" />
    <script source="/js/MinifyJpeg.js" />
    ******************************************
    var reader = new FileReader();
    reader.onloadend = (function(theFile)
    {
        return function(e)
        {
            var minified = MinifyJpeg.minify(e.target.result, 1280);

            // add image to body
            var enc = "data:image/jpeg;base64," + MinifyJpeg.encode64(minified);
            $('body').append('<img src="' + enc + '" alt="">');
        }
    })(f);
    reader.readAsDataURL(f);

Depend on
_________
  <https://github.com/notmasteryet/jpgjs>