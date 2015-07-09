module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-closurecompiler');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.initConfig({
        dist: './dist/',
        source: './src/',
        test: './test/',
        clean: {
            dist: ['<%= dist %>']
        },
        closurecompiler: {
            mono: {
                files: {
                    '<%= dist %>mono.min.js': '<%= dist %>mono.js'
                }
            },
            monoLib: {
                files: {
                    '<%= dist %>monoLib.min.js': '<%= dist %>monoLib.js'
                }
            }
        },
        jsbeautifier: {
            mono: {
                src: ['<%= dist %>mono.js']
            },
            monoLib: {
                src: ['<%= dist %>monoLib.js']
            },
            one: {
                src: ['<%= dist %>mono-*.js']
            }
        },
        copy: {
            mono: {
                expand: true,
                cwd: '<%= dist %>',
                src: 'mono.js',
                dest: '<%= test %>js/'
            },
            monoLib: {
                expand: true,
                cwd: '<%= dist %>',
                src: 'monoLib.js',
                dest: '<%= test %>vendor/firefox/lib/'
            }
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

    grunt.registerTask('buildMono', function() {
        var path = grunt.config('source');
        var content = extractIncludes(grunt.file.read(path + 'mono.js'), path);

        grunt.file.write(grunt.config('dist') + 'mono.js', content);
    });

    grunt.registerTask('buildMonoLib', function() {
        var path = grunt.config('source') + 'vendor/Firefox/lib/';
        var content = extractIncludes(grunt.file.read(path + 'monoLib.js'), path);

        grunt.file.write(grunt.config('dist') + 'monoLib.js', content);
    });

    grunt.registerTask('mono', ['buildMono','jsbeautifier:mono']);
    grunt.registerTask('mono.min', ['buildMono','closurecompiler:mono']);
    grunt.registerTask('monoLib', ['buildMonoLib','jsbeautifier:monoLib']);
    grunt.registerTask('monoLib.min', ['buildMonoLib','closurecompiler:monoLib']);

    var target = grunt.option('target') || '';

    var oneFunc;
    grunt.registerTask('one', oneFunc = function(_target) {
        var browser = _target || target;
        browser = browser.split(',').map(function(a){return a.trim()});

        var index = require('./index.js');
        var content = index.get.mono(browser);

        grunt.config('oneName', 'mono-'+browser.join('-')+'.js');
        grunt.file.write(grunt.config('dist') + grunt.config('oneName'), content);

        !_target && grunt.task.run('jsbeautifier:one');
    });

    grunt.registerTask('oneList', function() {
        var typeList = [
          'chrome',
          'oldChrome',
          'firefox',
          'gm',
          'opera',
          'safari',
          ['chrome', 'chromeApp'],
          ['chrome', 'localStorage'],
          ['oldChrome', 'localStorage']
        ];
        for (var i = 0, type; type = typeList[i]; i++) {
            if (Array.isArray(type)) {
                type = type.join(',');
            }
            oneFunc(type);
        }
        grunt.task.run('jsbeautifier:one');
    });

    grunt.registerTask('default', [
        'clean:dist',
        'mono',
        'copy:mono',
        'monoLib',
        'copy:monoLib'
    ]);
};