module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-closurecompiler');
    grunt.initConfig({
        closurecompiler: {
            main: {
                files: {
                    'mono.min.js': 'mono.js',
                    'monoLib.min.js': 'monoLib.js'
                }
            }
        },
        jsbeautifier: {
            files: ['mono.js', 'monoLib.js']
        }
    });

    var extractIncludes = function(content, path) {
        content = content.replace(/\/\/@include\s+([\w\/\.]+)/g, function(text, file) {
            var subPath = path + file;
            var pos = subPath.lastIndexOf('/');
            if (pos === -1) {
                subPath += '/';
            } else {
                subPath = subPath.substr(0, pos + 1);
            }
            return extractIncludes(grunt.file.read(path + file), subPath);
        });
        return content;
    };

    grunt.registerTask('mono', function() {
        var path = './src/';
        var content = extractIncludes(grunt.file.read(path + 'mono.js'), path);

        grunt.file.write('mono.js', content);
    });

    grunt.registerTask('monoLib', function() {
        var path = './src/vendor/Firefox/lib/';
        var content = extractIncludes(grunt.file.read(path + 'monoLib.js'), path);

        grunt.file.write('monoLib.js', content);
    });

    grunt.registerTask('copyInTest', function() {
        grunt.file.copy('mono.js', './test/js/mono.js');
        grunt.file.copy('monoLib.js', './test/vendor/firefox/lib/monoLib.js');
    });

    grunt.registerTask('default', [
        'mono',
        'monoLib',
        'jsbeautifier',
        'closurecompiler:main',
        'copyInTest'
    ]);
};