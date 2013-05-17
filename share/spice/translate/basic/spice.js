(function(root) {
    "use strict";

    var langs = {
        'ar': 'Arabic',
        'zh': 'Chinese',
        'cz': 'Czech',
        'en': 'English',
        'fr': 'French',
        'gr': 'Greek',
        'it': 'Italian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'pl': 'Polish',
        'pt': 'Portuguese',
        'ro': 'Romanian',
        'es': 'Spanish',
        'tr': 'Turkish'
    };

    var convert = {
        "cs": "cz",
        "ar": "ar",
        "zh": "zh",
        "en": "en",
        "fr": "fr",
        "el": "gr",
        "it": "it",
        "ja": "ja",
        "ko": "ko",
        "pl": "pl",
        "pt": "pt",
        "ro": "ro",
        "es": "es",
        "tr": "tr"
    };

    var hasOwn = ({}).hasOwnProperty;
    var translations = [];

    root.ddg_spice_translate_detect = function(ir) {
        var params = get_params(),
            words  = params[0],
            from   = ir.data.detections[0].language,
            to     = params[1],
            base;

        if (words.split('%20').length > 1) {
            base = '/js/spice/translate/my_memory/';

            nrj(base + from + '/' + to + '/' + words);
        } else {
            base = '/js/spice/translate/wordreference/';

            nrj(base + convert[from] + to + '/' + words);
        }
    };

    root.ddg_spice_translate_basic = function() {
        var params = get_params(),
            dict   = params[0],
            words  = params[1],
            from   = dict.slice(0, 2),
            to     = dict.slice(-2),
            base;

        if (words.split('%20').length > 1) {
            base = '/js/spice/translate/my_memory/';

            nrj(base + from + '/' + to + '/' + words);
        } else {
            base = '/js/spice/translate/wordreference/';

            nrj(base + dict + '/' + words);
        }
    };

    function get_params() {
        var scripts = document.getElementsByTagName('script'),
            regex,
            match;

        for (var i = 0; i < scripts.length; i++) {
            regex = /translate\/([a-z]+)\/(.+)\/(.+)/;
            match = scripts[i].src.match(regex);

            console.log(match);

            if (match !== undefined && match !== null) {
                return [match[2], match[3]];
            }
        }

        return ['', ''];
    }

    /* MyMemory */
    root.ddg_spice_translate_my_memory = function(ir) {
        var items = [[]],
            params = get_params_my_memory(),
            dict   = params[0],
            word   = decodeURIComponent(params[1]),
            from   = dict.slice(0, 2),
            to     = dict.slice(-2),
            text;

        if ((word === '') || (dict === '')) {
            return;
        }

        items[0].h = langs[to] + ' translations for ' + word;
        items[0].s = 'MyMemory';
        items[0].u = 'http://mymemory.translated.net/s.php?q=' + word + '&sl=' + from + '&tl=' + to;
        items[0].force_big_header = true;

        text = '<ul>';
        text += format_translations_my_memory(ir.matches);
        text += '</ul>';

        items[0].a = text;

        nra(items);
    };

    function get_params_my_memory() {
        var scripts = document.getElementsByTagName('script'),
            regex,
            match;

        for (var i = 0; i < scripts.length; i++) {
            regex = /translate\/my_memory\/(.+)\/(.+)/;
            match = scripts[i].src.match(regex);

            if (match !== undefined && match !== null) {
                return [match[1], match[2]];
            }
        }

        return ['', ''];
    }

    function format_translations_my_memory(ts) {
        var text = '', origi, first;

        for (var i in ts) {
            if(hasOwn.call(ts, i)) {
                origi = ts[i].segment;
                first = ts[i].translation;

                if (origi !== first) {
                    text += format_translation_my_memory(first);
                }
            }
        }

        return text;
    }


    function format_translation_my_memory(t) {
        var text;

        if (t === undefined) {
            return '';
        }
        if (translations.indexOf(t) !== -1) {
            return '';
        }
        else {
            translations.push(t);
        }

        text = '<li>' + t + '</li>';
        return text;
    }

    /* Wordreference */
    root.ddg_spice_translate_wordreference = function(ir) {
        var items = [[]],
            params = get_params_wordreference(),
            dict   = params[0],
            word   = params[1],
            to     = dict.slice(-2),
            text;
        
        if ((word === '') || (dict === '')) {
            return;
        }

        dict = convert[dict.slice(0, 2)] + to;
        items[0] = {
            h: langs[to] + ' translations for ' + word,
            s: 'Wordreference.com',
            u: 'http://wordreference.com/' + dict + '/' + word,
            force_big_header: true
        };

        if (ir.Error) {
            return;
        }

        text = '<ul>';
        text += format_term_wordreference(ir.term0, word);

        if (ir.term1 !== undefined) {
            text += format_term_wordreference(ir.term1, word);
        }

        text += '</ul>';

        if(text === '<ul></ul>') {
            return;
        }

        items[0].a = text;

        nra(items);
    };

    function get_params_wordreference() {
        var scripts = document.getElementsByTagName('script'),
            regex,
            match;

        for (var i = 0; i < scripts.length; i++) {
            regex = /translate\/wordreference\/(.+?)\/(.+)/;
            match = scripts[i].src.match(regex);

            if (match !== undefined && match !== null) {
                return [match[1], decodeURIComponent(match[2])];
            }
        }

        return ['', ''];
    }

    function format_term_wordreference(term, word) {
        if(term.PrincipalTranslations || term.Entries) {
            var text = format_translations_wordreference((term.PrincipalTranslations || term.Entries), word, false);
        } else if(term.OtherSideEntries) {
            var text = format_translations_wordreference(term.OtherSideEntries, word, true);
        }

        if (term.AdditionalTranslations) {
            text += format_translations_wordreference(term.AdditionalTranslations, word, true);
        }

        return text;
    }

    function format_translations_wordreference(ts, word, swap) {
        var text = '';
        var origi, first, secnd;
        var limit = 0;

        for (var i in ts) {
            if(hasOwn.call(ts, i) && limit < 3) {
                origi = ts[i].OriginalTerm;
                first = ts[i].FirstTranslation;
                secnd = ts[i].SecondTranslation;

                if(swap) {
                    origi = ts[i].FirstTranslation;
                    first = ts[i].OriginalTerm;
                }

                if (origi.term !== first.term) {
                    text += format_translation_wordreference(first);
                }

                if ((secnd !== undefined) && (origi.term !== secnd.term) && !swap) {
                    text += format_translation_wordreference(secnd);
                }
                limit += 1;
            }
        }

        return text;
    }

    function format_translation_wordreference(t) {
        var text;

        if (t === undefined || t === null) {
            return '';
        }
        if (translations.indexOf(t.term) !== -1) {
            return '';
        } else {
            translations.push(t.term);
        }

        text = '<li>' + t.term + '</li>';
        return text;
    }
}(this));