module.exports = function(grunt) {

  var merge = require("merge");

  var includes = ["**/*"];

  var config = {
    pkg: grunt.file.readJSON("package.json"),
    clean: ["build", "app/*", "dist"],
    copy: {
      stage: {
        files: [{
          expand: true,
          cwd: "src",
          src: ["**/*"],
          dest: "build/stage"
        },
        {
          expand: true,
          src: ["bower_components/**"],
          dest: "build/stage"
        }]
      },
      publish: {
        files: [{
          expand: true,
          cwd: "build/stage",
          src: includes,
          dest: "app"
        }]
      },
    }
  }

  merge(config, {
    express: {
      all: {
        options: {
          port: 9000,
          bases: ["app"],
          livereload: true
        }
      }
    },
    open: {
      all: {
        path: 'http://localhost:<%= express.all.options.port%>'
      }
    },
    watch: {
      src: {
        files: ['src/**/*', 'bower_components/**/*'],
        tasks: ['copy:stage', "do-setup", "do-validate", "do-build", "copy:publish"]
      }
    }
  });

  merge(config, {
    wiredep: {
      task: {
        directory: "build/stage/bower_components",
        src: ['build/stage/index.html']
      }
    }
  });

  //<humphrey:config:insert>//

  grunt.initConfig(config);

  require("load-grunt-tasks")(grunt);

  grunt.registerTask("do-wiredep", ["wiredep"]);
  grunt.registerTask("do-serve", ["build", "express", "open", "watch"]);
  //<humphrey:subtask:insert>//

  grunt.registerTask("do-setup", []);
  grunt.registerTask("do-validate", []);
  grunt.registerTask("do-build", ["do-wiredep"]);
  grunt.registerTask("do-test", []);
  grunt.registerTask("do-package", []);
  grunt.registerTask("do-archive", []);
  grunt.registerTask("do-deploy", []);

  grunt.registerTask("setup", ["clean", "copy:stage", "do-setup"]);
  grunt.registerTask("validate", ["setup", "do-validate"]);
  grunt.registerTask("build", ["validate", "do-build", "copy:publish"]);
  grunt.registerTask("test", ["build", "do-test"]);
  grunt.registerTask("package", ["test", "do-package"]);
  grunt.registerTask("archive", ["package", "do-archive"]);
  grunt.registerTask("deploy", ["archive", "do-deploy"]);

  grunt.registerTask("serve", ["do-serve"]);
  //<humphrey:task:insert>//

  grunt.registerTask("default", ["test"]);

};