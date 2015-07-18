module.exports = function (grunt) {
    "use strict";
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-closurecompiler');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.initConfig({
        dist: './dist/',
        source: './src/',
        test: './test/',
        clean: {
            dist: ['<%= dist %>/**']
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

    var extractIncludes = require('./extractIncludes.js').extractIncludes;

    grunt.registerTask('buildMono', function () {
        var path = grunt.config('source');

        var content = grunt.file.read(path + 'mono.js');

        content = '//@include vendor/Opera/userScript.js\n' + content;

        content = extractIncludes(content, path);

        grunt.file.write(grunt.config('dist') + 'mono.js', content);
    });

    grunt.registerTask('buildMonoLib', function () {
        var path = grunt.config('source') + 'vendor/Firefox/lib/';
        var content = extractIncludes(grunt.file.read(path + 'monoLib.js'), path);

        grunt.file.write(grunt.config('dist') + 'monoLib.js', content);
    });

    grunt.registerTask('mono', ['buildMono', 'jsbeautifier:mono']);
    grunt.registerTask('mono.min', ['buildMono', 'closurecompiler:mono']);
    grunt.registerTask('monoLib', ['buildMonoLib', 'jsbeautifier:monoLib']);
    grunt.registerTask('monoLib.min', ['buildMonoLib', 'closurecompiler:monoLib']);

    var target = grunt.option('target') || '';

    var oneFunc, uniFunc;
    grunt.registerTask('one', oneFunc = function (_target) {
        var browser = _target || target;
        browser = browser.split(',').map(function (a) {
            return a.trim()
        });

        var index = require('./index.js');
        var content = index.get.mono(browser);

        grunt.config('oneName', 'mono-' + browser.join('-') + '.js');
        grunt.file.write(grunt.config('dist') + grunt.config('oneName'), content);

        !_target && grunt.task.run('jsbeautifier:one');
    });
    grunt.registerTask('uni', uniFunc = function (_target) {
        var params = _target || target;
        params = params.split(',').map(function (a) {
            return a.trim()
        });
        var options = {};
        params.forEach(function(item) {
            var kv = item.split('=');
            options[kv[0]] = kv[1];
        });

        var index = require('./index.js');
        var content = index.get.uniMono(options);

        grunt.config('oneName', 'mono-' + params.join('-') + '.js');
        grunt.file.write(grunt.config('dist') + grunt.config('oneName'), content);

        !_target && grunt.task.run('jsbeautifier:one');
    });

    grunt.registerTask('oneList', function () {
        var typeList = [
            'firefox',
            'gm',
            'opera',
            ['opera', 'localStorage'],
            'safari'
        ];
        ['chrome', 'oldChrome'].forEach(function(type) {
            ['', 'chromeApp', 'chromeWebApp'].forEach(function (type2) {
                var list = [type];
                type2 && list.push(type2);

                typeList.push(list.slice(0));
                if (type2 !== 'chromeApp') {
                    list.push('localStorage');
                    
                    typeList.push(list);
                }
            });
        });
        for (var i = 0, type; type = typeList[i]; i++) {
            if (Array.isArray(type)) {
                type = type.join(',');
            }
            oneFunc(type);
        }
        grunt.task.run('jsbeautifier:one');
    });

    grunt.registerTask('uniList', function () {
        var config = [
            [
                'useChrome=1',
                'useFf=1',
                'chromeUseDirectMsg=1',
                'oldChromeSupport=1'
            ],
            [
                'useChrome=1',
                'oldChromeSupport=1',
                'useChromeWebApp=1'
            ],
            [
                'useChrome=1',
                'useFf=1',
                'oldChromeSupport=1'
            ],
            [
                'useChrome=1',
                'useFf=1'
            ]
        ];
        for (var i = 0, type; type = config[i]; i++) {
            if (Array.isArray(type)) {
                type = type.join(',');
            }
            uniFunc(type);
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