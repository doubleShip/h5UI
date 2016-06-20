
var gulp        = require('gulp'),
    pngquant    = require('imagemin-pngquant'),
    browserSync = require('browser-sync'),
    spritesmith = require('gulp.spritesmith'),
    pkg         = require('./package.json'),
    gulpPlugins = require('gulp-load-plugins');

var $ = gulpPlugins();

// js语法检测配置
var jshintConfig = {
    "curly": true, // true: Require {} for every new block or scope
    "eqeqeq": true, // true: Require triple equals (===) for comparison
    "immed": true, // true: Require immediate invocations to be wrapped in parens e.g. `(function () { } ());`
    "latedef": true, // true: Require variables/functions to be defined before being used
    "newcap": true, // true: Require capitalization of all constructor functions e.g. `new F()`
    "noarg": true, // true: Prohibit use of `arguments.caller` and `arguments.callee`
    "sub": true, // true: Prohibit use of empty blocks
    "undef": true, // true: Require all non-global variables to be declared (prevents global leaks)
    "boss": true, // true: Require all defined variables be used
    "eqnull": true, // true: Requires all functions run in ES5 Strict Mode
    "es3": true, // {int} Max number of formal params allowed per function
    "node": true, // {int} Max depth of nested blocks (within functions)
    "-W117": true // {int} Max number statements per function
};

var banner = [
    '/*!',
    ' * PhoneUI v<%= pkg.version %>',
    ' * Created by Yvan on <%= new Date().getFullYear() %>',
    ' */',
    ''].join('\n');

var cleanSrc = ['./dist/**'],
    htmlSrc = ['./src/*.html'],
    styleSrc = [
        'src/style/**/!(_)*.scss'
    ],
    jsSrc = [
        'src/js/**/*.{js,es6}'
    ],
    jsConcat = [
        'src/js/config.{js,es6}',
        'src/js/base.{js,es6}'
    ],
    jsUgly = [
        'src/js/**/*.{js,es6}',
        '!./src/js/class/*.{js,es6}',
        '!./src/js/component/*.{js,es6}',
        '!./src/js/core/*.{js,es6}',
        '!./src/js/config.{js,es6}'
    ],
    imgSrc = ['src/images/*.{png,jpg,gif,ico}'],
    htmlDst = './dist/',
    jsDst = './dist/js',
    jsSourceMap = '/maps',
    cssDst = './dist/css',
    imgDst = './dist/images';

var deleteDistFile = function(path,cb) {
    var file = path.substr(path.indexOf('demo')+4),
        files = file.split(".");
    if(files[files.length-1] == "js") {
        del(['./dist'+file.substr(0,file.length-2)+'min.js'], cb);
    }
    else if(files[files.length-1] == "css") {
        del(['./dist'+file.substr(0,file.length-3)+'min.css'], cb);
    }
    else {
        del(['./dist'+file], cb);
    }
};

// 清空图片、样式、js
gulp.task('clean', function(cb) {
    //gulp.src(cleanSrc, {read: false})
    //    .pipe(clean({force: true}));
    del(cleanSrc, cb);
});

// HTML处理
gulp.task('html', function() {
    gulp.src(htmlSrc)
        .pipe(gulp.dest(htmlDst))
});

// 编译sass
gulp.task('sass', function () {
    gulp.src(styleSrc)
        .pipe($.sass())
        .pipe($.autoprefixer({
            browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
            cascade: false, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe($.header(banner, { pkg : pkg } ))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.minifyCss())
        .pipe(gulp.dest(cssDst))
});

gulp.task('sprite', function () {
    var spriteData = gulp.src('src/images/slice/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.less'
    }));
    spriteData.img.pipe(gulp.dest('src/images/'));
    spriteData.img.pipe(gulp.dest('dist/images/'));
    spriteData.css.pipe(gulp.dest('src/sass/'));
});

// js处理
gulp.task('js', function () {
    gulp.src(jsUgly)
        .pipe($.babel({modules: 'common'})) //es6转es5
        .pipe($.jshint(jshintConfig))
        .pipe($.jshint.reporter('default'))
        .pipe($.sourcemaps.init())    // 初始化sourcemaps
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.uglify({}))
        .pipe($.sourcemaps.write(jsSourceMap))
        .pipe(gulp.dest(jsDst));

    //拼接js
    gulp.src(jsConcat)
        .pipe($.babel({modules: 'common'})) //es6转es5
        .pipe($.concat('main.js'))
        .pipe($.rename({suffix: '.min'}))
        .pipe($.uglify())
        .pipe(gulp.dest('dist/js'));
});

// 图片处理
gulp.task('images', function(){
    gulp.src(imgSrc)
        .pipe($.cache($.imagemin({
            optimizationLevel: 5,
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
            use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
        })))
        .pipe(gulp.dest(imgDst))
});

gulp.task('webpack', function () {
    gulp.src(jsSrc)
        .pipe($.webpack(require('./webpack.config.js')))
        //.pipe($.rename({ suffix: '.min' }))
        //.pipe(gulp.dest(jsDst))
        //.pipe($.uglify({}))
        .pipe(gulp.dest(jsDst))
});


// 默认任务 清空图片、样式、js并重建 运行语句 gulp
gulp.task('build', function(){
    gulp.start('clean','html','sass','js','images');
});

// Default task
gulp.task('default', ['build']);

gulp.task('watch', function() {

    //Watch .html files
    gulp.watch(htmlSrc, ['html'])
        .on('change', function(event) {
            if(event.type == "deleted") {
                deleteDistFile(event.path,function(e) {
                    console.log(e)
                });
            }
        });

    //Watch .scss files
    gulp.watch(['src/style/**/*.scss'], ['sass'])
        .on('change', function(event) {
            if(event.type == "deleted") {
                deleteDistFile(event.path,function(e) {
                    console.log(e)
                });
            }
        });

    // Watch .js files
    //gulp.watch(jsSrc, ['webpack'])
    //    .on('change', function(event) {
    //        if(event.type == "deleted") {
    //            deleteDistFile(event.path,function(e) {
    //                console.log(e)
    //            });
    //        }
    //    });

    // Watch image files
    //gulp.watch(imgSrc, ['images'])
    //    .on('change', function(event) {
    //        if(event.type == "deleted") {
    //            deleteDistFile(event.path,function(e) {
    //                console.log(e)
    //            });
    //        }
    //    });

    browserSync.init({
        server: {
            baseDir: "./dist/"
        }
    });

    gulp.watch(['dist/**'])
        .on('change', browserSync.reload);
});