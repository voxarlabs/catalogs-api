module.exports = function(grunt) {

  grunt.initConfig({

    watch: {
       files: ['app/js/**/*', 'app/index.html'],
       tasks: ['build']
    },
    concat: {
      dist: {
        src: ['app/js/**/*'],
        dest: 'dist/spreadsheet.js',
      },
    },
  });

    
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('build', [
    'concat:dist'
  ]);

};