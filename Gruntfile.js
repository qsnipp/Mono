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

    var n = 0;
    grunt.registerTask("custom", function() {
        var params = this.args;

        var options = {};
        var keyList = [];
        params = params.length && params[0].split(',').map(function (a) {
            var value = a.trim();
            var keyValue = value.split('=');
            options[keyValue[0]] = keyValue[1];
            keyList.push(keyValue[0]);
            return value;
        });

        var index = require('./index.js');
        var content = index.get.mono(options);

        var fileName = 'mono-' + keyList.join(',') + '.js';
        var taskName = 'id' + n++;

        var jsBeautifier = {};
        jsBeautifier[taskName] = {
            src: ['<%= dist %>' + fileName]
        };
        grunt.config.merge({
            jsbeautifier: jsBeautifier
        });

        grunt.file.write(grunt.config('dist') + fileName, content);

        grunt.task.run('jsbeautifier:' + taskName);
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
                'useFf=1',
                'oldChromeSupport=1'
            ],
            [
                'useChrome=1',
                'useFf=1'
            ],
            [
                'useChrome=1'
            ],
            [
                'useGm=1'
            ],
            [
                'useFF=1'
            ],
            [
                'useOpera=1'
            ],
            [
                'useOpera=1',
                'useLocalStorage=1'
            ],
            [
                'useSafari=1'
            ]
        ];

        ['useChrome=1'].forEach(function(browser) {
            var flags = ['oldChromeSupport=1', 'chromeUseDirectMsg=1', 'chromeForceDefineBgPage=1', 'useLocalStorage=1', 'useChromeApp=1', 'useChromeWebApp=1'];
            flags.forEach(function(key, i) {
                for (var n = i; n < flags.length; n++) {
                    var flagList = flags.slice(i, n);
                    if (!flagList.length) {
                        continue;
                    }
                    flagList.unshift(browser);
                    config.push(flagList);
                }
            });
        });

        var taskList = [];
        for (var i = 0, type; type = config[i]; i++) {
            if (Array.isArray(type)) {
                type = type.join(',');
            }
            taskList.push('custom:' + type);
        }

        grunt.task.run(taskList);
    });

    grunt.registerTask('default', [
        'clean:dist',
        'mono',
        'copy:mono',
        'monoLib',
        'copy:monoLib'
    ]);
};