////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LogFactory.jsx                                                                                                                                     //
// Version 1                                                                                                                                          //
// 1st Published: 6th Mar 2017                                                                                                                        //
// Modified: 6th Mar 2017                                                                                                                             //
// Copyright &copy; 2017 Trevor https://creative-scripts.com                                                                                            //
// May be used on condition that this comment block is left in                                                                                        //
// May not be distributed on the Web (A link to https://creative-scripts.com/logging-with-a-smile/ is allowed)                                     //
//                                                                                                                                                    //
// DESCRIPTION: A LogFactory with some extras                                                                                                         //
// Provided 'as is', with no warranty whatsoever.                                                                                                     //
// Use and adapted the function freely providing you leave in these comment lines and specify if you have made adaptations                            //
// Redistribution on the Web is not allowed.                                                                                                          //
// The function is wrapped by the LogFactory so that multiple logs can be maintained simultaneously                                                   //
// THANKS OKO see http://stackoverflow.com/questions/31232157/what-is-the-best-way-to-copy-but-not-clone-a-function-in-javascript/31235167#31235167   //
// Minimal Instructions                                                                                                                               //
// 1) Paste or #include the LogFactory.jsx to the start of the script. (One can use either the full version or the squished one)                      //
// 2) Set up the log file                                                                                                                             //
// var log = new LogFactory('pathToLogFile'); // a few other options here can be added                                                                //
// 3) Do some logging                                                                                                                                 //
// log('hello world'); // logs with default status                                                                                                    //
// log('hello world', 'i'); // logs with 'Info' status                                                                                                //
// log('hello world', 't', 'happy'); // logs with 'Trace' status with a smile                                                                         //
// For detailed instructions see https://creative-scripts.com/logging-with-a-smile/                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// jshint unused:true, undef: true
/* globals $, Folder, File */

/**
 * [LogFactory description]
 * @param {String or File Object}   file          [Optional] The location of the log file to create or append
 *                                                           @@@ This argument can be an object in the form
 *                                                           @@@ {file: 'pathToFile', write: boolean, store: boolean, level: String or Integer, status: string}
 *                                                           All keys in the object are optional
 *                                                           (Use of the object for is recommended if not using default values for the other arguments)
 *                                                           Default file value is pathToTempFolder/LOG_Script Name_Year_Month_Date.log for example LOG_Script2_2017_Feb_21.log
 *                                                           See LOG.setFile below
 * @param {Boolean}                 write         [Optional] Whether or not to write to the log file
 *                                                           Default true
 *                                                           See LOG.get() below
 * @param {Boolean}                 store         [Optional] Whether or not to store to the log file as an array in memory
 *                                                           Default false
 * @param {String or Integer}       level         [Optional] The level from which the log values should be logged from (Case insensitive)
 *                                                           Default 2 / Debug
 *                                                           See LOG.get() below
 * @param {String}                  defaultStatus [Optional] The log default status (Case insensitive)
 *                                                           Default 'LOG' this has the log level of 2 / Debug
 *                                                           See LOG.setLevel below
 * @param {Boolean}                 continuing [Optional]       Whether or not the log numbering continues from the previous entry recorded in the log
 *                                                           If false the log count will restart each time a new LogFactory is created
 *                                                           If true and the already log exists the next log entry will continue from the last log count
 *                                                           Default false
 *                                                           See LOG.setLevel below
 * @returns {Function} The LOG function                      If one does var log = new LogFactory('myLog.log');
 *                                                           One can then start using log('hello world');
 *                                                           SEE THE FULL INSTRUCTIONS https://creative-scripts.com/logging-with-a-smile/  
 */
module.exports = function(file, write, store, level, defaultStatus, continuing) { // jshint ignore: line
    /////////////////////////////
    // Allow passing of Object //
    /////////////////////////////
    if (file && (file.constructor === String || file.constructor === File)) {
        file = {
            file: file
        };
    } else if (!file) file = {
        file: {}
    };
    write = (file.write !== undefined) ? file.write : write;
    if (write === undefined) {
        write = true;
    }
    store = (file.store !== undefined) ? file.store || false : store || false;
    level = (file.level !== undefined) ? file.level : level;
    defaultStatus = (file.defaultStatus !== undefined) ? file.defaultStatus : defaultStatus;
    if (defaultStatus === undefined) {
        defaultStatus = 'LOG';
    }
    continuing = (file.continuing !== undefined) ? file.continuing : continuing || false;
    file = file.file || {};

    var stack, times, logTime, logPoint, icons, statuses, LOG_LEVEL, LOG_STATUS;
    stack = [];
    times = [];
    logTime = new Date();
    logPoint = 'Log Factory Start';
    icons = {
        "1": "\ud83d\udd50", "130": "\ud83d\udd5c", "2": "\ud83d\udd51", "230": "\ud83d\udd5d", "3": "\ud83d\udd52", "330": "\ud83d\udd5e", "4": "\ud83d\udd53", "430": "\ud83d\udd5f", "5": "\ud83d\udd54", "530": "\ud83d\udd60", "6": "\ud83d\udd55", "630": "\ud83d\udd61", "7": "\ud83d\udd56", "730": "\ud83d\udd62", "8": "\ud83d\udd57", "830": "\ud83d\udd63", "9": "\ud83d\udd58", "930": "\ud83d\udd64", "10": "\ud83d\udd59", "1030": "\ud83d\udd65", "11": "\ud83d\udd5a", "1130": "\ud83d\udd66", "12": "\ud83d\udd5b", "1230": "\ud83d\udd67", "AIRPLANE": "\ud83d\udee9", "ALARM": "\u23f0", "AMBULANCE": "\ud83d\ude91", "ANCHOR": "\u2693", "ANGRY": "\ud83d\ude20", "ANGUISHED": "\ud83d\ude27", "ANT": "\ud83d\udc1c", "ANTENNA": "\ud83d\udce1", "APPLE": "\ud83c\udf4f", "APPLE2": "\ud83c\udf4e", "ATM": "\ud83c\udfe7", "ATOM": "\u269b", "BABYBOTTLE": "\ud83c\udf7c", "BAD:": "\ud83d\udc4e", "BANANA": "\ud83c\udf4c", "BANDAGE": "\ud83e\udd15", "BANK": "\ud83c\udfe6", "BATTERY": "\ud83d\udd0b", "BED": "\ud83d\udecf", "BEE": "\ud83d\udc1d", "BEER": "\ud83c\udf7a", "BELL": "\ud83d\udd14", "BELLOFF": "\ud83d\udd15", "BIRD": "\ud83d\udc26", "BLACKFLAG": "\ud83c\udff4", "BLUSH": "\ud83d\ude0a", "BOMB": "\ud83d\udca3", "BOOK": "\ud83d\udcd5", "BOOKMARK": "\ud83d\udd16", "BOOKS": "\ud83d\udcda", "BOW": "\ud83c\udff9", "BOWLING": "\ud83c\udfb3", "BRIEFCASE": "\ud83d\udcbc", "BROKEN": "\ud83d\udc94", "BUG": "\ud83d\udc1b", "BUILDING": "\ud83c\udfdb", "BUILDINGS": "\ud83c\udfd8", "BULB": "\ud83d\udca1", "BUS": "\ud83d\ude8c", "CACTUS": "\ud83c\udf35", "CALENDAR": "\ud83d\udcc5", "CAMEL": "\ud83d\udc2a", "CAMERA": "\ud83d\udcf7", "CANDLE": "\ud83d\udd6f", "CAR": "\ud83d\ude98", "CAROUSEL": "\ud83c\udfa0", "CASTLE": "\ud83c\udff0", "CATEYES": "\ud83d\ude3b", "CATJOY": "\ud83d\ude39", "CATMOUTH": "\ud83d\ude3a", "CATSMILE": "\ud83d\ude3c", "CD": "\ud83d\udcbf", "CHECK": "\u2714", "CHEQFLAG": "\ud83c\udfc1", "CHICK": "\ud83d\udc25", "CHICKEN": "\ud83d\udc14", "CHICKHEAD": "\ud83d\udc24", "CIRCLEBLACK": "\u26ab", "CIRCLEBLUE": "\ud83d\udd35", "CIRCLERED": "\ud83d\udd34", "CIRCLEWHITE": "\u26aa", "CIRCUS": "\ud83c\udfaa", "CLAPPER": "\ud83c\udfac", "CLAPPING": "\ud83d\udc4f", "CLIP": "\ud83d\udcce", "CLIPBOARD": "\ud83d\udccb", "CLOUD": "\ud83c\udf28", "CLOVER": "\ud83c\udf40", "CLOWN": "\ud83e\udd21", "COLDSWEAT": "\ud83d\ude13", "COLDSWEAT2": "\ud83d\ude30", "COMPRESS": "\ud83d\udddc", "CONFOUNDED": "\ud83d\ude16", "CONFUSED": "\ud83d\ude15", "CONSTRUCTION": "\ud83d\udea7", "CONTROL": "\ud83c\udf9b", "COOKIE": "\ud83c\udf6a", "COOKING": "\ud83c\udf73", "COOL": "\ud83d\ude0e", "COOLBOX": "\ud83c\udd92", "COPYRIGHT": "\u00a9", "CRANE": "\ud83c\udfd7", "CRAYON": "\ud83d\udd8d", "CREDITCARD": "\ud83d\udcb3", "CROSS": "\u2716", "CROSSBOX:": "\u274e", "CRY": "\ud83d\ude22", "CRYCAT": "\ud83d\ude3f", "CRYSTALBALL": "\ud83d\udd2e", "CUSTOMS": "\ud83d\udec3", "DELICIOUS": "\ud83d\ude0b", "DERELICT": "\ud83c\udfda", "DESKTOP": "\ud83d\udda5", "DIAMONDLB": "\ud83d\udd37", "DIAMONDLO": "\ud83d\udd36", "DIAMONDSB": "\ud83d\udd39", "DIAMONDSO": "\ud83d\udd38", "DICE": "\ud83c\udfb2", "DISAPPOINTED": "\ud83d\ude1e", "CRY2": "\ud83d\ude25", "DIVISION": "\u2797", "DIZZY": "\ud83d\ude35", "DOLLAR": "\ud83d\udcb5", "DOLLAR2": "\ud83d\udcb2", "DOWNARROW": "\u2b07", "DVD": "\ud83d\udcc0", "EJECT": "\u23cf", "ELEPHANT": "\ud83d\udc18", "EMAIL": "\ud83d\udce7", "ENVELOPE": "\ud83d\udce8", "ENVELOPE2": "\u2709", "ENVELOPE_DOWN": "\ud83d\udce9", "EURO": "\ud83d\udcb6", "EVIL": "\ud83d\ude08", "EXPRESSIONLESS": "\ud83d\ude11", "EYES": "\ud83d\udc40", "FACTORY": "\ud83c\udfed", "FAX": "\ud83d\udce0", "FEARFUL": "\ud83d\ude28", "FILEBOX": "\ud83d\uddc3", "FILECABINET": "\ud83d\uddc4", "FIRE": "\ud83d\udd25", "FIREENGINE": "\ud83d\ude92", "FIST": "\ud83d\udc4a", "FLOWER": "\ud83c\udf37", "FLOWER2": "\ud83c\udf38", "FLUSHED": "\ud83d\ude33", "FOLDER": "\ud83d\udcc1", "FOLDER2": "\ud83d\udcc2", "FREE": "\ud83c\udd93", "FROG": "\ud83d\udc38", "FROWN": "\ud83d\ude41", "GEAR": "\u2699", "GLOBE": "\ud83c\udf0d", "GLOWINGSTAR": "\ud83c\udf1f", "GOOD:": "\ud83d\udc4d", "GRIMACING": "\ud83d\ude2c", "GRIN": "\ud83d\ude00", "GRINNINGCAT": "\ud83d\ude38", "HALO": "\ud83d\ude07", "HAMMER": "\ud83d\udd28", "HAMSTER": "\ud83d\udc39", "HAND": "\u270b", "HANDDOWN": "\ud83d\udc47", "HANDLEFT": "\ud83d\udc48", "HANDRIGHT": "\ud83d\udc49", "HANDUP": "\ud83d\udc46", "HATCHING": "\ud83d\udc23", "HAZARD": "\u2623", "HEADPHONE": "\ud83c\udfa7", "HEARNOEVIL": "\ud83d\ude49", "HEARTBLUE": "\ud83d\udc99", "HEARTEYES": "\ud83d\ude0d", "HEARTGREEN": "\ud83d\udc9a", "HEARTYELLOW": "\ud83d\udc9b", "HELICOPTER": "\ud83d\ude81", "HERB": "\ud83c\udf3f", "HIGH_BRIGHTNESS": "\ud83d\udd06", "HIGHVOLTAGE": "\u26a1", "HIT": "\ud83c\udfaf", "HONEY": "\ud83c\udf6f", "HOT": "\ud83c\udf36", "HOURGLASS": "\u23f3", "HOUSE": "\ud83c\udfe0", "HUGGINGFACE": "\ud83e\udd17", "HUNDRED": "\ud83d\udcaf", "HUSHED": "\ud83d\ude2f", "ID": "\ud83c\udd94", "INBOX": "\ud83d\udce5", "INDEX": "\ud83d\uddc2", "JOY": "\ud83d\ude02", "KEY": "\ud83d\udd11", "KISS": "\ud83d\ude18", "KISS2": "\ud83d\ude17", "KISS3": "\ud83d\ude19", "KISS4": "\ud83d\ude1a", "KISSINGCAT": "\ud83d\ude3d", "KNIFE": "\ud83d\udd2a", "LABEL": "\ud83c\udff7", "LADYBIRD": "\ud83d\udc1e", "LANDING": "\ud83d\udeec", "LAPTOP": "\ud83d\udcbb", "LEFTARROW": "\u2b05", "LEMON": "\ud83c\udf4b", "LIGHTNINGCLOUD": "\ud83c\udf29", "LINK": "\ud83d\udd17", "LITTER": "\ud83d\udeae", "LOCK": "\ud83d\udd12", "LOLLIPOP": "\ud83c\udf6d", "LOUDSPEAKER": "\ud83d\udce2", "LOW_BRIGHTNESS": "\ud83d\udd05", "MAD": "\ud83d\ude1c", "MAGNIFYING_GLASS": "\ud83d\udd0d", "MASK": "\ud83d\ude37", "MEDAL": "\ud83c\udf96", "MEMO": "\ud83d\udcdd", "MIC": "\ud83c\udfa4", "MICROSCOPE": "\ud83d\udd2c", "MINUS": "\u2796", "MOBILE": "\ud83d\udcf1", "MONEY": "\ud83d\udcb0", "MONEYMOUTH": "\ud83e\udd11", "MONKEY": "\ud83d\udc35", "MOUSE": "\ud83d\udc2d", "MOUSE2": "\ud83d\udc01", "MOUTHLESS": "\ud83d\ude36", "MOVIE": "\ud83c\udfa5", "MUGS": "\ud83c\udf7b", "NERD": "\ud83e\udd13", "NEUTRAL": "\ud83d\ude10", "NEW": "\ud83c\udd95", "NOENTRY": "\ud83d\udeab", "NOTEBOOK": "\ud83d\udcd4", "NOTEPAD": "\ud83d\uddd2", "NUTANDBOLT": "\ud83d\udd29", "O": "\u2b55", "OFFICE": "\ud83c\udfe2", "OK": "\ud83c\udd97", "OKHAND": "\ud83d\udc4c", "OLDKEY": "\ud83d\udddd", "OPENLOCK": "\ud83d\udd13", "OPENMOUTH": "\ud83d\ude2e", "OUTBOX": "\ud83d\udce4", "PACKAGE": "\ud83d\udce6", "PAGE": "\ud83d\udcc4", "PAINTBRUSH": "\ud83d\udd8c", "PALETTE": "\ud83c\udfa8", "PANDA": "\ud83d\udc3c", "PASSPORT": "\ud83d\udec2", "PAWS": "\ud83d\udc3e", "PEN": "\ud83d\udd8a", "PEN2": "\ud83d\udd8b", "PENSIVE": "\ud83d\ude14", "PERFORMING": "\ud83c\udfad", "PHONE": "\ud83d\udcde", "PILL": "\ud83d\udc8a", "PING": "\u2757", "PLATE": "\ud83c\udf7d", "PLUG": "\ud83d\udd0c", "PLUS": "\u2795", "POLICE": "\ud83d\ude93", "POLICELIGHT": "\ud83d\udea8", "POSTOFFICE": "\ud83c\udfe4", "POUND": "\ud83d\udcb7", "POUTING": "\ud83d\ude21", "POUTINGCAT": "\ud83d\ude3e", "PRESENT": "\ud83c\udf81", "PRINTER": "\ud83d\udda8", "PROJECTOR": "\ud83d\udcfd", "PUSHPIN": "\ud83d\udccc", "QUESTION": "\u2753", "RABBIT": "\ud83d\udc30", "RADIOACTIVE": "\u2622", "RADIOBUTTON": "\ud83d\udd18", "RAINCLOUD": "\ud83c\udf27", "RAT": "\ud83d\udc00", "RECYCLE": "\u267b", "REGISTERED": "\u00ae", "RELIEVED": "\ud83d\ude0c", "ROBOT": "\ud83e\udd16", "ROCKET": "\ud83d\ude80", "ROLLING": "\ud83d\ude44", "ROOSTER": "\ud83d\udc13", "RULER": "\ud83d\udccf", "SATELLITE": "\ud83d\udef0", "SAVE": "\ud83d\udcbe", "SCHOOL": "\ud83c\udfeb", "SCISSORS": "\u2702", "SCREAMING": "\ud83d\ude31", "SCROLL": "\ud83d\udcdc", "SEAT": "\ud83d\udcba", "SEEDLING": "\ud83c\udf31", "SEENOEVIL": "\ud83d\ude48", "SHIELD": "\ud83d\udee1", "SHIP": "\ud83d\udea2", "SHOCKED": "\ud83d\ude32", "SHOWER": "\ud83d\udebf", "SLEEPING": "\ud83d\ude34", "SLEEPY": "\ud83d\ude2a", "SLIDER": "\ud83c\udf9a", "SLOT": "\ud83c\udfb0", "SMILE": "\ud83d\ude42", "SMILING": "\ud83d\ude03", "SMILINGCLOSEDEYES": "\ud83d\ude06", "SMILINGEYES": "\ud83d\ude04", "SMILINGSWEAT": "\ud83d\ude05", "SMIRK": "\ud83d\ude0f", "SNAIL": "\ud83d\udc0c", "SNAKE": "\ud83d\udc0d", "SOCCER": "\u26bd", "SOS": "\ud83c\udd98", "SPEAKER": "\ud83d\udd08", "SPEAKEROFF": "\ud83d\udd07", "SPEAKNOEVIL": "\ud83d\ude4a", "SPIDER": "\ud83d\udd77", "SPIDERWEB": "\ud83d\udd78", "STAR": "\u2b50", "STOP": "\u26d4", "STOPWATCH": "\u23f1", "SULK": "\ud83d\ude26", "SUNFLOWER": "\ud83c\udf3b", "SUNGLASSES": "\ud83d\udd76", "SYRINGE": "\ud83d\udc89", "TAKEOFF": "\ud83d\udeeb", "TAXI": "\ud83d\ude95", "TELESCOPE": "\ud83d\udd2d", "TEMPORATURE": "\ud83e\udd12", "TENNIS": "\ud83c\udfbe", "THERMOMETER": "\ud83c\udf21", "THINKING": "\ud83e\udd14", "THUNDERCLOUD": "\u26c8", "TICKBOX": "\u2705", "TICKET": "\ud83c\udf9f", "TIRED": "\ud83d\ude2b", "TOILET": "\ud83d\udebd", "TOMATO": "\ud83c\udf45", "TONGUE": "\ud83d\ude1b", "TOOLS": "\ud83d\udee0", "TORCH": "\ud83d\udd26", "TORNADO": "\ud83c\udf2a", "TOUNG2": "\ud83d\ude1d", "TRADEMARK": "\u2122", "TRAFFICLIGHT": "\ud83d\udea6", "TRASH": "\ud83d\uddd1", "TREE": "\ud83c\udf32", "TRIANGLE_LEFT": "\u25c0", "TRIANGLE_RIGHT": "\u25b6", "TRIANGLEDOWN": "\ud83d\udd3b", "TRIANGLEUP": "\ud83d\udd3a", "TRIANGULARFLAG": "\ud83d\udea9", "TROPHY": "\ud83c\udfc6", "TRUCK": "\ud83d\ude9a", "TRUMPET": "\ud83c\udfba", "TURKEY": "\ud83e\udd83", "TURTLE": "\ud83d\udc22", "UMBRELLA": "\u26f1", "UNAMUSED": "\ud83d\ude12", "UPARROW": "\u2b06", "UPSIDEDOWN": "\ud83d\ude43", "WARNING": "\u26a0", "WATCH": "\u231a", "WAVING": "\ud83d\udc4b", "WEARY": "\ud83d\ude29", "WEARYCAT": "\ud83d\ude40", "WHITEFLAG": "\ud83c\udff3", "WINEGLASS": "\ud83c\udf77", "WINK": "\ud83d\ude09", "WORRIED": "\ud83d\ude1f", "WRENCH": "\ud83d\udd27", "X": "\u274c", "YEN": "\ud83d\udcb4", "ZIPPERFACE": "\ud83e\udd10", "UNDEFINED": "", "": ""
    };
    statuses = {
        /* OFF */
        /* FATAL */
        F: 'FATAL',
        /* ERROR */
        B: 'BUG',
        C: 'CRITICAL',
        E: 'ERROR',
        /* WARN */
        W: 'WARNING',
        /* INFO */
        I: 'INFO',
        IM: 'IMPORTANT',
        /* DEBUG */
        D: 'DEBUG',
        L: 'LOG',
        CO: 'CONSTANT',
        FU: 'FUNCTION',
        R: 'RETURN',
        V: 'VARIABLE',
        S: 'STACK',
        /* TRACE */
        RE: 'RESULT',
        ST: 'STOPPER',
        TI: 'TIMER',
        T: 'TRACE'
            /* ALL */
    };

    LOG_LEVEL = {
        NONE: 7,
        OFF: 7,
        FATAL: 6,
        ERROR: 5,
        WARN: 4,
        INFO: 3,
        UNDEFINED: 2,
        '': 2,
        DEFAULT: 2, // Should be the same as UNDEFINED and '' so if desired change them all;
        DEBUG: 2,
        TRACE: 1,
        ON: 0,
        ALL: 0,
    };

    LOG_STATUS = {
        OFF: LOG_LEVEL.OFF,
        NONE: LOG_LEVEL.OFF,
        NO: LOG_LEVEL.OFF,
        NOPE: LOG_LEVEL.OFF,
        FALSE: LOG_LEVEL.OFF,

        FATAL: LOG_LEVEL.FATAL,

        BUG: LOG_LEVEL.ERROR,
        CRITICAL: LOG_LEVEL.ERROR,
        ERROR: LOG_LEVEL.ERROR,

        WARNING: LOG_LEVEL.WARN,

        INFO: LOG_LEVEL.INFO,
        IMPORTANT: LOG_LEVEL.INFO,

        DEBUG: LOG_LEVEL.DEBUG,
        LOG: LOG_LEVEL.DEBUG,
        STACK: LOG_LEVEL.DEBUG,
        CONSTANT: LOG_LEVEL.DEBUG,
        FUNCTION: LOG_LEVEL.DEBUG,
        VARIABLE: LOG_LEVEL.DEBUG,
        RETURN: LOG_LEVEL.DEBUG,

        RESULT: LOG_LEVEL.TRACE,
        STOPPER: LOG_LEVEL.TRACE,
        TIMER: LOG_LEVEL.TRACE,
        TRACE: LOG_LEVEL.TRACE,

        ALL: LOG_LEVEL.ALL,
        YES: LOG_LEVEL.ALL,
        YEP: LOG_LEVEL.ALL,
        TRUE: LOG_LEVEL.ALL
    };

    var logFile, logFolder;

    /**
     * [LOG]   This is our main hero function that's created by calling the LogFactory
     *         i.e. var log = new LogFactory();
     *         See the annotations to the LogFactory function for the default values
     *         Once create we use log('Hello'); log('Hello', 'i'); or log('Hello', 'i' ,'happy');
     *         It has many methods and properties.
     *         Methods include :   LOG.setFile(), LOG.setStatus(), LOG.setLevel(), LOG.cookie(), 
     *                             LOG.args(), LOG.stack(), LOG.values(), LOG.sumDiff(),
     *                             LOG.stopper(), LOG.start(), LOG.stop(), log.setCount(),
     *                             LOG.get(), LOG.openFolder(), LOG.execute(), LOG.show(),
     *                             LOG.close(), LOG.file(), LOG.reset(),
     *         Properties include: LOG.write, LOG.store, LOG.level, LOG.status, LOG.count
     * @param {String}   message 'say something here'
     * @param {String}   status  [Optional] (takes abbreviations) (Case insensitive) DEFAULT value LOG.status
     *                           The levels of the statuses are explained by the annotation to the LOG.setLevel() function
     *                           Only logs entries with statuses equal or higher than the LOG.level value will be logged
     * @param {[String]} icon    [Optional] (Adds emojis to the beginning of the message)
     *                           (Case insensitive) Valid values are listed https://creative-scripts.com/logging-with-a-smile/#LOG
     *                           See also the object near to the beginning of the LogFactory function 'icons = {''
     *                           
     */
    var LOG = function(message, status, icon) {
        if (LOG.level !== LOG_LEVEL.OFF && (LOG.write || LOG.store) && LOG.arguments.length) return LOG.addMessage(message, status, icon);
    };

    /**
     * [LOG.logDecodeLevel description]
     * @param  {String, Integer, Boole} level (Case insensitive) valid values include:
     *                                         7, NONE, OFF, NONE, NOPE, FALSE,
     *                                         6, FATAL, FA,
     *                                         5, ERROR, BUG, CRITICAL, e, b, c,
     *                                         4, WARN, WARNING, w,
     *                                         3, INFO, IMPORTANT, ON, i, im,
     *                                         2, DEBUG, LOG, STACK, CONSTANT, FUNCTION, VARIABLE, RETURN, d, l, co, f, r, v, s,
     *                                         1, TRACE, RESULT, STOPPER, TIMER, tr, re, st, ti, t,
     *                                         0, ALL,YES, YEP, TRUE
     * @return {Integer}                      The integer value of the level string
     */
    LOG.logDecodeLevel = function(level) {
        // accept integers
        if (level == ~~level) return Math.abs(level);
        var lev;
        level += '';
        level = level.toUpperCase();
        // accept abbreviations
        if (level in statuses) {
            level = statuses[level];
        }
        // accept generic levels like WARN etc. stored in the LOG_LEVEL object
        lev = LOG_LEVEL[level];
        if (lev !== undefined) return lev;
        // accept level by status like CONSTANT stored in LOG_STATUS object
        lev = LOG_STATUS[level];
        if (lev !== undefined) return lev;
        // we did try (and fail) so resort to default level
        return LOG_LEVEL.DEFAULT;
    };
    /////////////////////////////////
    // Set some defaults if needed //
    /////////////////////////////////
    LOG.write = write;
    LOG.store = store;
    LOG.level = LOG.logDecodeLevel(level);
    LOG.status = defaultStatus;


    /**
     * See annotations to main LOG functions
     * Use LOG(message, status, icon) when calling from a created log factory i.e.
     * var log = new LogFactory();
     * use log('Hi'); and not log.addMessage('Hi');
     */
    LOG.addMessage = function(message, status, icon) {
        var date = new Date(),
            count, bool, logStatus;
        if (status && status.constructor.name === 'String') {
            status = status.toUpperCase();
            status = statuses[status] || status;
        } else status = LOG.status;
        /////////////////////////////////////////////////////////////
        // Check the status is above or equal to the set LOG.level //
        /////////////////////////////////////////////////////////////
        logStatus = LOG_STATUS[status] || LOG_STATUS.ALL;
        if (logStatus < LOG.level) return;
        //////////////////////////////////////////////////////
        // If the LOG status is appropriate then log it <span class="wp-font-emots-emo-happy"></span> //
        //////////////////////////////////////////////////////
        date = '\t[' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds() + ']';
        status = '\t[' + status + '] ';
        if (status.length < 11) status = (status + '           ').substr(0, 11);
        if (icon) {
            icon = ('' + icon).toUpperCase();
            icon = (icon in icons && icons[icon]) || '';
        } else {
            icon = '';
        }
        if (LOG.count !== ~~LOG.count) {
            LOG.count = 1;
        }
        count = (LOG.count > 999) ? '[' + LOG.count + '] ' : ('   [' + LOG.count + '] ').slice(-7);
        message = count + date + status + icon + (message instanceof Object ? message.toSource() : message);
        if (LOG.store) {
            stack.push(message);
        }
        if (LOG.write) {
            bool = file && file.writable && logFile.writeln(message);
            // if the file could not be written to try again
            // it could be that it was closed or
            //  was not created because LOG.write was set to false and this is the first write attempt after setting to true.
            if (!bool) {
                file.writable = true;
                LOG.setFile(logFile);
                logFile.writeln(message);
            }
        }
        LOG.count++;
        return true;
    };

    /**
     * [logNewFile description]        Internal function for creating / preparing the log and cookie files
     *                                 When used for the log file it sets the logFile and logFolder properties
     * @param  {File Object}  file     The log or cookie file
     * @param  {Boolean} isCookie      [Optional] Whether or not the file is a cookie file see annotation by the LOG.writeFile() method
     *                                 Default value false;
     * @param  {Boolean}  overwrite    [Optional] Whether or not to overwrite the value stored in the COOKIE file
     *                                 Default value true; has no effect unless isCookie is set to true
     * @return {File (or Boolean)}     The file. if isCookie is set to true and the file could not be opened then false is returned
     */
    var logNewFile = function(file, isCookie, overwrite) {
        file.encoding = 'UTF-8'; // Might be a good idea to add a '\uFEFF' BOM character at the beginning of the file if it's not there
        file.lineFeed = ($.os[0] == 'M') ? 'Unix' : ' Windows';
        if (isCookie) return file.open(overwrite ? 'w' : 'e') && file;
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Can't use readonly on non existent files, so we made up this.                                                             //
        // The point of using the writable flag is so that the log file can be setup without being created                           //
        // a practical use of this would be if we only want the log file to be created if a certain trigger happens (like and error) //
        // if the stack option is set then the log file can retrospectively save a range of previous logs.                           //
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        file.writable = LOG.write;
        logFile = file;
        logFolder = file.parent;
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // if LOG.write is set to false then we can return true no matter what                                                             //
        // if the LOG.write is later set to true then the setFile function will be called on the next log call and thus call this function //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        if (continuing) {
            LOG.count = LOG.setCount(file);
        }
        return (!LOG.write && file || (file.open('a') && file));
    };

    /**
     * [setFile description]                     Used for setting the log file
     *                                           When used for the log file it sets the logFile and logFolder properties
     * @param  {File Object or String} file      The log or cookie file
     * @param  {Boolean}               isCookie  [Optional] Whether or not the file is a cookie file see annotation by the LOG.writeFile() method
     *                                           Default value false;
     * @param  {Boolean}               overwrite [Optional] Whether or not to overwrite the value stored in the COOKIE file
     *                                           Default value true; has no effect unless isCookie is set to true
     * @return {File (or Boolean)}     The file. if isCookie is set to true and the file could not be opened then false is returned
     */
    LOG.setFile = function(file, isCookie, overwrite) {
        // the file can be accessed using log.File
        var bool, folder, fileName, suffix, newFileName, f, d, safeFileName;
        d = new Date();
        // For ESTK Get the file name from the $.stack, this works from non-saved files $.fileName doesn't
        // For external runners (like Sublime Text) use $.fileName in cases that the stack returns a number
        // Such as when the log factory is included using #include
        f = $.stack.split("\n")[0].replace(/^\[\(?/, '').replace(/\)?\]$/, '');
        if (f == ~~f) {
            f = $.fileName.replace(/[^\/]+\//g, '');
        }
        safeFileName = File.encode(
            (isCookie ? '/COOKIE_' : '/LOG_') +
            f.replace(/^\//, '') + '_' + (1900 + d.getYear()) + (d.toString()).replace(/... (...) (..).+/, '_$1_$2') +
            (isCookie ? '.txt' : '.log')
        );
        if (file && file.constructor.name == 'String') {
            file = (file.match('/')) ? new File(file) : new File((logFolder || Folder.temp.toString()) + '/' + file); // if the file contains a folder path then use that folder path if it just contains a file name then use the logFolder and if the logFolder is undefined then use the temp folder
        }
        if (file instanceof File) {
            // for some reason the file cannot be written so will try write the log using the same folder and different but similar file name.
            folder = file.parent;
            bool = folder.exists || folder.create();
            if (!bool) folder = Folder.temp;
            fileName = File.decode(file.name);
            suffix = fileName.match(/\.[^.]+$/);
            suffix = suffix ? suffix[0] : '';
            fileName = '/' + fileName;
            newFileName = fileName.replace(/\.[^.]+$/, '') + '_' + ((new Date()).toString() + suffix);
            f = logNewFile(file, isCookie, overwrite);
            if (f) return f; // try open the file as is
            f = logNewFile(new File(folder + newFileName), isCookie, overwrite);
            if (f) return f; // try first to keep the file folder and different but similar file name
            f = logNewFile(new File(folder + safeFileName), isCookie, overwrite);
            if (f) return f; // nope, so try write to the folder with a safe file name.
            if (folder != Folder.temp) {
                f = logNewFile(new File(Folder.temp + fileName), isCookie, overwrite);
                if (f) return f; // nope so try again but use the temp folder
                // LAST ATTEMPT, IF THIS FAILS IT MEANS TROUBLE (but you can't say we didn't try)
                // p.s. It will only fail if you have very major permissions problems or your disk is full
                f = logNewFile(new File(Folder.temp + safeFileName), isCookie, overwrite);
                // NO MATTER WHAT !!
                return f || new File(Folder.temp + safeFileName);
            }
        }
        return LOG.setFile(
            ((logFile && !isCookie) ? new File(logFile) : new File(Folder.temp + safeFileName)),
            isCookie,
            overwrite
        ); // no string or file given so use the file stored in logFile if there is and if not use the temp folder with a safe name.
    };

    /**
     * [setCount]            
     * @param file {File Object, String of full file path, Integer, undefined} [OPTIONAL]
     *             Either the path of the log file to from which to continue the log count.
     *             Default value is the path to the current log file.
     *             Or an integer to set the current log count.
     *             By default the log count resets to 1 each time a new LogFactory is created
     *             If this function is called either on the creation of the LogFactory
     *             var log = new LogFactory({file: 'myLog.log', continuing: true});
     *             or by calling it directly log.setCount(); then if the log file exists
     *             the log count will not automatically reset to 1
     *             rather it will continue from the last entry in the log
     *             The function is not 100% reliable but close enough.
     *             To make it 100% fail proof would cost too much resources than it's value
     */
    LOG.setCount = function(file) {
        if (~~file === file) { // files really an integer and not a file
            LOG.count = file;
            return LOG.count;
        }
        if (file === undefined) {
            file = logFile;
        }
        if (file && file.constructor === String) {
            file = new File(file);
        }
        var logNumbers, contents;
        if (!file.length || !file.exists) {
            LOG.count = 1;
            return 1;
        }
        file.open('r');
        file.encoding = 'utf-8';
        // The log could be very long and we wouldn't want to read it all
        // So we'll just check the last 10000 characters for a line number
        // In theory the last log entry could be really log so if the below test fails we'll increase the range
        file.seek(10000, 2);
        contents = '\n' + file.read();
        // this will match all line number entries
        // it could match non line number entries but it's quite unlikely and will have to do!   
        logNumbers = contents.match(/\n {0,3}\[\d+\] \[\w+\] +/g);
        if (logNumbers) {
            logNumbers = +logNumbers[logNumbers.length - 1].match(/\d+/) + 1;
            file.close();
            LOG.count = logNumbers;
            return logNumbers;
        }
        // if we get here it means we didn't find a line number yet
        // if we checked the whole file already then we know to start at 1
        if (file.length < 10001) {
            file.close();
            LOG.count = 1;
            return 1;
        }
        // if we get here it means we didn't find a line number yet
        // we didn't check the whole file yet so we'll increase the range
        // we'll do up to about 10MB, if the last log entry is longer than that then this will fail
        // in such a case the log count will start again at  1
        // if you don't like that then you can just use file.seek(0); but it's probably not a good idea
        file.seek(10000000, 2);
        contents = '\n' + file.read();
        // this will match all line number entries
        // it could match non line number entries but it's quite unlikely and will have to do!   
        logNumbers = contents.match(/\n {0,3}\[\d+\] \[\w+\] +/g);
        if (logNumbers) {
            logNumbers = +logNumbers[logNumbers.length - 1].match(/\d+/) + 1;
            file.close();
            LOG.count = logNumbers;
            return logNumbers;
        }
        // if we get here it means we didn't find a line number yet
        file.close();
        LOG.count = 1;
        return 1;
    };
    /**
     * [setLevel description] Used for setting the LOG.level
     * @param  {String, Integer, Boole} level Takes any of the values described in the logDecodeLevel function above
     * There are 8 levels for 0 to 7, any of the below values may be used in setting the level by the log.setLevel() and the new LogFactory() methods.
     * 7, NONE, OFF, NONE, NOPE, FALSE
     * 6, FATAL, FA
     * 5, ERROR, BUG, CRITICAL, e, b, c
     * 4, WARN, WARNING, w
     * 3, INFO, IMPORTANT, ON, i, im
     * 2, DEBUG, LOG, STACK, CONSTANT, FUNCTION, VARIABLE, RETURN, d, l, co, f, r, v, s
     * 1, TRACE, RESULT, STOPPER, TIMER, tr, re, st, ti, t
     * 0, ALL,YES, YEP, TRUE
     * Only logs whose statuses are of equal or higher level than the level given here will be logged
     * If the log level was set to 'error':
     * log.setLevel('e');
     * log('Be Careful', 'w'); => diddlysquat the WARNING [4] level doesn't meet our minimum error [5] level
     * log('De2ad', 'fa'); // => [1] [FATAL]   Dead [Sun Mar 05 2017 10:05:02 GMT+0200 562ms]
     * @returns {Integer} the set log level
     */
    LOG.setLevel = function(level) {
        LOG.level = LOG.logDecodeLevel(level);
        return LOG.level;
    };

    /**
     * setStatus  Sets the default status to be assigned then the log function is called without specifying a status
     * @param {Sting} status Accepts the following abbreviations,
        FA: 'FATAL',
        B: 'BUG', C: 'CRITICAL', E: 'ERROR', 
        W: 'WARNING',
        I: 'INFO', IM: 'IMPORTANT',
        D: 'DEBUG', L: 'LOG', CO: 'CONSTANT', F: 'FUNCTION', R: 'RETURN', V: 'VARIABLE', S: 'STACK',
        RE: 'RESULT', ST: 'STOPPER', TI: 'TIMER', T: 'TRACE'
        These recognized statuses are assigned levels as described in the LOG.setLevel method above
        Custom level 0 statuses can be used
     */
    LOG.setStatus = function(status) {
        status = ('' + status).toUpperCase();
        LOG.status = statuses[status] || status;
        return LOG.status;
    };

    /**
     * [cookie description] For getting and setting a level to a cookie file
     *                          A typical usage of the log.cookie method would be in a distributed production script.
     *                          Normally one wouldn't want the log to be automatically created,
     *                          instead one would want a method for the user to activate the logging by either
     *                          manually changing the contents of the log cookie or by using a provided UI option.
     * @param  {File Object or String} file - The file path of the log cookie.
     *                          The same rules apply for the file cookie file name as in the log.setFile() method,
     *                          as such the file name and path might not be the expected one.
     *                          The actual cookie file path can be extracted from the object returned by the method.
     *                          [Optional - default: A cookie file will be created in the temporary folder and called
     *                          COOKIE_Script Name_Year_Month_Date.txt for example COOKIE_Script2_2017_Feb_21.txt
     *                          effectively leaving out the file name creates a temporary cookie that will be valid until midnight] 
     * @param  {String or Integer} level - accepts the values that the setLevel() method does, see there 
     * @param  {Boolean}        overwrite - [Optional - default: false] if true then will overwrite any existing value in the cookie
     * @param  {Boolean}        setLevel - [Optional - default: true] If the log level should be set to the cookies level value
     * @return {Object}         {path: The actual path of the file cookie, level: the integer value of the level}
     * @Note                    This method also accepts use an object in the form of 
     *                          var myCookie = log.cookie({file: 'myCookie.txt', level: 'error', overwrite: true, setLevel: true});
     */

    LOG.cookie = function(file, level, overwrite, setLevel) {
        var log, cookie;
        if (!file) {
            file = {
                file: file
            };
        }
        // allow for objects and argument lists
        if (file && (file.constructor === String || file.constructor === File)) {
            file = {
                file: file
            };
        }
        log = file;
        if (log.level === undefined) {
            log.level = (level !== undefined) ? level : 'NONE';
        }
        if (log.overwrite === undefined) {
            log.overwrite = (overwrite !== undefined) ? overwrite : false;
        }
        if (log.setLevel === undefined) {
            log.setLevel = (setLevel !== undefined) ? setLevel : true;
        }
        setLevel = log.setLevel;
        overwrite = log.overwrite;
        level = log.level;
        file = log.file;
        file = LOG.setFile(file, true, overwrite);
        if (overwrite) {
            file.write(level);
        } else {
            cookie = file.read();
            if (cookie.length) {
                level = cookie;
            } else {
                file.write(level);
            }
        }
        file.close();
        if (setLevel) {
            LOG.setLevel(level);
        }
        return {
            path: file,
            level: level
        };
    };


    /**
     * [args]   Logs a well formatted report of a function with all it arguments values and names if named
     *          also shows the function name (if it has one) and more info
     *          Note: The info is assigned a FUNCTION status which has a level of 2
     *          If the LOG.level is set to 3 or above then the LOG.args() method will not do anything
     * @param  {Function arguments} args   The arguments to be parsed
     *                                     Typically one would place the line log.args(arguments); // no quote around arguments
     *                                     inside a function to get a snapshot of the arguments values
     * @param  {Function} funct [Optional] For es5 strict mode compliance one can pass the function
     *                                     (whose arguments one is processing) to this argument (currently not needed)
     * @param  {Integer} line   [Optional] The line number of the function caller.
     *                                     can use log.args(arguments, $.line);
     * @return {String}                    The report produced
     */
    LOG.args = function(args, funct, line) {
        // IF the debug level is not set to the DEBUG / FUNCTION level then return without waisting resources
        if (LOG.level > LOG_STATUS.FUNCTION) return;
        // The 5th edition of ECMAScript (ES5) forbids use of arguments.callee() in strict mode.
        // So if you want to play safe for that then pass both the arguments and the function
        // If the functions anonymous then you could have difficulty passing the function
        // A non-airtight check if the args being feed are function arguments
        // This function might be quite resource greedy
        if (!(args && ('' + args.constructor).replace(/\s+/g, '') === 'functionObject(){[nativecode]}')) return;
        // The general regex method for getting the arguments names appears several places on the web
        // I can't remember were I saw it and can't give credits for it
        // This particular implementation of it here is made by me Trevor https://creative-scripts.com
        if (!LOG.args.STRIP_COMMENTS) {
            LOG.args.STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        }
        if (!LOG.args.ARGUMENT_NAMES) {
            LOG.args.ARGUMENT_NAMES = /([^\s,]+)/g;
        }
        if (!LOG.args.OUTER_BRACKETS) {
            LOG.args.OUTER_BRACKETS = /^\((.+)?\)$/;
        }
        if (!LOG.args.NEW_SOMETHING) {
            LOG.args.NEW_SOMETHING = /^new \w+\((.+)?\)$/;
        }
        var functionString, argumentNames, stackInfo, report,
            functionName, arg, argsL, n, argName, argValue, argsTotal;
        // The funct value might actually be the line number as it's an optional value so
        if (funct === ~~funct) {
            line = funct;
        }
        if (!(funct instanceof Function)) {
            funct = args.callee;
        }

        if (!(funct instanceof Function)) return;
        functionName = funct.name;
        functionString = ('' + funct).replace(LOG.args.STRIP_COMMENTS, '');
        argumentNames = functionString.slice(functionString.indexOf('(') + 1, functionString.indexOf(')')).match(LOG.args.ARGUMENT_NAMES);
        // could be there's no matches so
        argumentNames = argumentNames || [];
        report = [];
        report.push('--------------');
        report.push('Function Data:');
        report.push('--------------');
        report.push('Function Name: ' + functionName);
        argsL = args.length;
        // could be there some useful info in the $.stack
        stackInfo = $.stack.split(/[\n\r]/);
        stackInfo.pop();
        stackInfo = stackInfo.join('\n                              ');
        report.push('Call stack: ' + stackInfo);
        if (line) {
            report.push('Function Line around: ' + line);
        }
        report.push('Arguments Provided: ' + argsL);
        report.push('Named Arguments: ' + argumentNames.length);
        if (argumentNames.length) {
            report.push('Arguments Names: ' + argumentNames.join(', '));
        }
        if (argsL) {
            report.push('----------------');
            report.push('Argument Values:');
            report.push('----------------');
        }
        argsTotal = Math.max(argsL, argumentNames.length);
        for (n = 0; n < argsTotal; n++) {
            argName = argumentNames[n];
            arg = args[n];
            if (n >= argsL) {
                argValue = 'NO VALUE PROVIDED';
            } else if (arg === undefined) {
                argValue = 'undefined';
            } else if (arg === null) {
                argValue = 'null';
            } else {
                argValue = arg.toSource().replace(LOG.args.OUTER_BRACKETS, '$1').replace(LOG.args.NEW_SOMETHING, '$1');
            }
            report.push((argName ? argName : 'arguments[' + n + ']') + ': ' + argValue);
        }
        report.push('');
        report = report.join('\n                  ');
        LOG(report, 'f');
        return report;
    };

    /**
     * [stack] Logs the current call stack info formated
     * @param  {Boolean} reverse [Optional] if true the last function called in the call stack is at the top
     *                                      Default false
     * @return {String} The formatted stack (function names and argument values but not names)
     *                  Can use the more detailed log.args(arguments); method for more detailed info
     */
    LOG.stack = function(reverse) {
        var st = $.stack.split('\n');
        st.pop();
        st.pop();
        if (reverse) {
            st.reverse();
        }
        return LOG(st.join('\n                  '), 's');
    };

    /**
     * [values Logs a neatly presented list of values of a array or object]
     * @param  {Array or Object} values [description]
     * @return {String}       The log produced
     */
    LOG.values = function(values) {
        var n, value, map = [];
        if (!(values instanceof Object || values instanceof Array)) {
            return;
        }
        if (!LOG.values.OUTER_BRACKETS) {
            LOG.values.OUTER_BRACKETS = /^\((.+)?\)$/;
        }
        if (!LOG.values.NEW_SOMETHING) {
            LOG.values.NEW_SOMETHING = /^new \w+\((.+)?\)$/;
        }
        for (n in values) {
            try {
                value = values[n];
                if (value === undefined) {
                    value = 'undefined';
                } else if (value === null) {
                    value = 'null';
                } else {
                    value = value.toSource().replace(LOG.values.OUTER_BRACKETS, '$1').replace(LOG.values.NEW_SOMETHING, '$1');
                }
            } catch (e) {
                value = '\uD83D\uDEAB ' + e;
            }
            map.push(n + ': ' + value);
        }
        if (map.length) {
            map = map.join('\n                  ') + '\n                  ';
            return LOG(map, 'v');
        }
    };

    /**
     * reset For reseting the count and log stack or all the log values
     * @param  {Boolean} all [Optional] whether only the stack and count are reset or if also additional properties
     * @return void
     * Probably this function need some playing with to reset missed out properties, enjoy!
     */
    LOG.reset = function(all) {
        stack.length = 0;
        LOG.count = 1;
        if (all !== false) {
            if (logFile instanceof File) {
                logFile.close();
            }
            logFile = LOG.store = LOG.writeToFile = undefined;
            LOG.write = true;
            logFolder = Folder.temp;
            logTime = new Date();
            logPoint = 'After Log Reset';
        }
    };

    /**
     * stopper description log the time elapsed between one log.stopper() call and the next log.stopper call
     * @param  {String or false} message [Optional] if false then just the time will be recored with no logging
     *                                   Otherwise the timing will be logged
     * @return {String}         The log produced
     */
    LOG.stopper = function(message) {
        var newLogTime, t, m, newLogPoint;
        newLogTime = new Date();
        newLogPoint = (LOG.count !== undefined) ? 'LOG#' + LOG.count : 'BEFORE LOG#1';
        LOG.time = t = newLogTime - logTime;
        if (message === false) {
            return;
        }
        message = message || 'Stopper start point';
        t = LOG.prettyTime(t);
        m = message + '\n                  ' +
            'From ' + logPoint + ' to ' + newLogPoint +
            ' took ' + t + ' Starting ' + logTime + ' ' + logTime.getMilliseconds() + 'ms' +
            ' Ending ' + newLogTime + ' ' + newLogTime.getMilliseconds() + 'ms';
        LOG(m, 'st');
        logPoint = newLogPoint;
        logTime = newLogTime;
        return m;
    };

    /**
     * start sets up the start times to be logged when calling the LOG.stop() method.
     * @param  {String} message [Optional]
     * @return {String}         The timing report
     */
    LOG.start = function(message) {
        var t = new Date();
        times.push([t, (message !== undefined) ? message + '' : '']);
    };

    /**
     * stop logs times from the paired LOG.start registered times.
     *         Differs from the stopper method in that the times act as brackets
     *         log.start('point 1');
     *         log.start('point 2');
     *         log.stop('This will give the time from point 2');
     *         log.stop('This will give the time from point 1');
     * @param  {String} message [Optional]
     * @return {String}         The timing report
     */
    LOG.stop = function(message) {
        if (!times.length) return;
        message = (message) ? message + ' ' : '';
        var nt, startLog, ot, om, td, m;
        nt = new Date();
        // startLog = times[0];
        startLog = times.pop();
        // times.splice(0, 1);
        ot = startLog[0];
        om = startLog[1];
        td = nt - ot;
        if (om.length) {
            om += ' ';
        }
        m = om + 'STARTED [' + ot + ' ' + ot.getMilliseconds() + 'ms]\n                  ' + message + 'FINISHED [' + nt + ' ' + nt.getMilliseconds() + 'ms]\n                  TOTAL TIME [' + LOG.prettyTime(td) + ']';
        LOG(m, 'ti');
        return m;
    };

    /**
     * [prettyTime] Represents ms times in the more friendly hours, minutes, seconds, ms format
     * @param  {Integer} t the amount of ms
     * @return {Sting} Formatted time  3 hours 25 minutes 45 seconds  & 678ms is more meaningful than 12345678ms (to me anyway!)
     */
    LOG.prettyTime = function(t) {
        var h, m, s, ms;
        h = Math.floor(t / 3600000);
        m = Math.floor((t % 3600000) / 60000);
        s = Math.floor((t % 60000) / 1000);
        ms = t % 1000;
        t = (!t) ? '<1ms' : ((h) ? h + ' hours ' : '') + ((m) ? m + ' minutes ' : '') + ((s) ? s + ' seconds ' : '') + ((ms && (h || m || s)) ? ' & ' : '') + ((ms) ? ms + 'ms' : '');
        return t;
    };


    /**
     * [get description] alerts the selected lines i.e.
     *                             log.alert(3,6,-1); will alert (1 alert not 3) the 3rd, 6th and last log entry in the stack
     *                             Note: by default the stack is set not to record so unless the stack has been set either
     *                             at the formation of the LogFactory or by using log.store = true;
     *                             Note if the log.store was not set at the same time as the log.write then the numbers won't be in sync
     * @return {undefined}
     */

    LOG.get = function() {
        if (!stack.length) return 'THE LOG IS NOT SET TO STORE';
        var a = fetchLogLines(arguments);
        return a ? '\n' + a.join('\n') : 'NO LOGS AVAILABLE';
    };

    /** [fetchLogLines] interprets the arguments of the LOG.alert, LOG.wl and LOG.range methods */
    var fetchLogLines = function() {
        var args = arguments[0];
        if (!args.length) return stack; // will return the whole log array to be outputted
        var c, n, l, a = [],
            ln, start, end, j, sl;
        l = args.length;
        sl = stack.length - 1;
        n = 0;
        for (c = 0; c < l; c++) {
            ln = args[c];
            if (~~ln === ln) { // the argument is an integer
                ln = (0 > ln) ? sl + ln + 1 : ln - 1;
                if (ln >= 0 && ln <= sl) a[n++] = stack[ln];
            } else if (ln instanceof Array && ln.length === 2) {
                start = ln[0];
                end = ln[1];
                if (!(~~start === start && ~~end === end)) continue; // the arguments are invalid so continue
                // ln = (0 > ln) ? sl + ln + 1 : ln - 1;
                start = (0 > start) ? sl + start + 1 : start - 1;
                end = (0 > end) ? sl + end + 1 : end - 1;
                start = Math.max(Math.min(sl, start), 0);
                end = Math.min(Math.max(end, 0), sl);
                if (start <= end)
                    for (j = start; j <= end; j++) a[n++] = stack[j];
                else
                    for (j = start; j >= end; j--) a[n++] = stack[j]; // go backwards
            }
        }
        return (n) ? a : false;
    };

    // to allow external access to logFile
    LOG.file = function() {
        return logFile;
    };

    /** [openFolder opens the containing folder of the log file if there is one] */
    LOG.openFolder = function() {
        if (logFolder) return logFolder.execute();
    };
    /** [openFolder opens the log file if there is one with the default application for opening the file suffix you picked for the log] */
    LOG.show = LOG.execute = function() {
        if (logFile) return logFile.execute();
    };
    /** [close Closes the log file] */
    LOG.close = function() {
        if (logFile) return logFile.close();
    };

    LOG.setFile(file);

    ////////////////////////////////////////////////////////////////////////////////////////
    // Thanks to Dirk Becker http://www.ixta.com/scripts/utilities/summaryDifference.html //
    // For permission to use his summaryDifference function                               //
    ////////////////////////////////////////////////////////////////////////////////////////
    if (!$.summary.difference) {
        $.summary.difference = function() {
            return $.summary().replace(
                / *([0-9]+) ([^ ]+)(\n?)/g,
                $.summary.updateSnapshot
            );
        };
    }
    if (!$.summary.updateSnapshot) {
        $.summary.updateSnapshot = function(full, count, name, lf) {
            var snapshot = $.summary.snapshot;
            count = Number(count);
            var prev = snapshot[name] ? snapshot[name] : 0;
            snapshot[name] = count;
            var diff = count - prev;
            if (diff === 0) return "";
            return "     ".substring(String(diff).length) + diff + " " + name + lf;
        };
    }

    if (!$.summary.snapshot) {
        $.summary.snapshot = [];
        $.summary.difference();
    }

    $.gc();
    $.gc();
    $.summary.difference();
    /**
     * [sumDiff description]
     * @param  {[type]} message [description]
     * @return {[type]}         [description]
     */
    LOG.sumDiff = function(message) {
        $.gc();
        $.gc();
        var diff = $.summary.difference();
        if (diff.length < 1) {
            diff = ' - NONE -';
        }
        if (message === undefined) {
            message = '';
        }
        message += diff;
        return LOG('$.summary.difference(): ' + message, 'v');
    };
    return LOG;
}; // end of LogFactory