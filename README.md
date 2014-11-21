JavaScript-MinifyJpeg
=====================

To minify JPEG images without losing EXIF.


Demo
----
    Copy this project on desktop and open example.html


Functions
---------
    minify(image, sideLength) - Resizes propotionally. Returns resized jpeg data as Uint8Array.
          If desired size is bigger than input, no manipulation is done.
        image - jpeg data(DataURL string or ArrayBuffer)
        sideLength - int value of new image's long side length
    encode64(data) - Convert Typed Array to DataURL string


How to Use
----------
    <input type="file" id="files" name="files[]" multiple />
    <script source="/js/jpg.js" />
    <script source="/js/MinifyJpeg.js" />
    ******************************************
    function handleFileSelect(evt) {
        var files = evt.target.files;

        for (var i = 0, f; f = files[i]; i++){
            var reader = new FileReader();
            reader.onloadend = (function(theFile){
                return function(e){
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


License
-------
    This software is released under the MIT License, see LICENSE.txt.


Depends on jpg.js
-----------------
    When this software is used with 'jpg.js', specify jpg.js's license.