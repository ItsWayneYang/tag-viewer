TAG_VIEWER = (function() {

    /**
     * initialize this module
     * @param {object} settings New settings for this module
     */
    var init = function(settings) {
        TAG_VIEWER.cfg = {
            $sort_options: $("#sort-options"),
            $url_input: $("input.input-url"),
            $url_form: $("#sform"),
            $loading_panel: $("#loading-panel"),
            $source_panel: $("#html-src"),
            $quote: $("#quote"),
            $author: $("#author"),
            $error_panel: $("#error-panel"),
            $reason_text: $("#error-panel .reason"),

            // options for jquery.syntax plugin
            syntax_options: {
                brush: 'html',
                layout: 'table',
                theme: 'paper',
                replace: true
            },
            quotes: [
                {
                    text: 'The best performance improvement is the transition from the nonworking state to the working state',
                    author: 'J. Osterhout'
                },
                {
                    text: 'There are two ways to write error-free programs; only the third one works',
                    author: 'Alan J. Perlis'
                },
                {
                    text: 'Before software can be reusable it first has to be usable',
                    author: 'Ralph Johnson'
                },
                {
                    text: 'Deleted code is debugged code',
                    author: 'Jeff Sickel'
                }
            ]
        };

        $.extend(true, TAG_VIEWER.cfg, settings);
        setup();
    };

    /**
     * Set up event listeners
     */
    var setup = function() {
        // set up event listeners
        TAG_VIEWER.cfg.$sort_options.change(sortOptionsChange);

        TAG_VIEWER.cfg.$url_input.focus(function(e) {
            $(e.target).parent().addClass("active")
        });

        TAG_VIEWER.cfg.$url_input.blur(function(e) {
            $(e.target).parent().removeClass("active")
        });

        TAG_VIEWER.cfg.$url_form.submit(formSubmit);
    };

    /**
     * Update loading text with a random quote
     */
    var updateQuote = function() {
        var i = Math.floor(TAG_VIEWER.cfg.quotes.length * Math.random());
        var quote = TAG_VIEWER.cfg.quotes[i];
        TAG_VIEWER.cfg.$quote.text(quote.text);
        TAG_VIEWER.cfg.$author.text(quote.author);
    };

    /**
     * Form submit handler.
     * @param {object} e Event object.
     */
    var formSubmit = function(e) {
        e.preventDefault();

        updateQuote();
        TAG_VIEWER.cfg.$source_panel.hide();
        TAG_VIEWER.cfg.$loading_panel.show();
        TAG_VIEWER.cfg.$error_panel.hide();

        var $form = TAG_VIEWER.cfg.$url_form;
        var url = $form.attr("action");
        var data = $form.serializeArray();

        // TODO:  check if data array has valid url
        $.post(url, data)
        .done(function(data) {
            TAG_VIEWER.cfg.$loading_panel.hide();
            TAG_VIEWER.cfg.$source_panel.show();
            
            // update summary view
            updateSummaryView(data);
            // update html view
            updateSourceView(data);
        })
        .fail(function(xhr) {
            var error_msg = xhr.responseJSON.error.message;
            TAG_VIEWER.cfg.$loading_panel.hide();
            TAG_VIEWER.cfg.$source_panel.hide();
            TAG_VIEWER.cfg.$error_panel.show();
            TAG_VIEWER.cfg.$reason_text.text(error_msg);
        });
    }


    /**
     * Add html syntax highlight. Update source view.
     * @param {object} data Ajax response from server.
     */
    var updateSourceView = function(data) {
        var syntax_options = TAG_VIEWER.cfg.syntax_options;
        $('<pre>'+data.html+'</pre>').syntax(syntax_options, function(options, html, container) {
            // update source code view
            TAG_VIEWER.cfg.$source_panel.html(html);
        });
    };

    /**
     * Compute tag frequency and update summary view
     * @param {object} data Ajax response
     */
    var updateSummaryView = function(data) {
        // update the summary view
        // tagname => count 
        var summary = data.summary;
        var keys = Object.keys(summary);
        var len = keys.length;
        keys.sort();

        var li_html = '';
        for (var i = 0; i < len; i++) {
            var tag = keys[i];
            var count = summary[tag];
            li_html += '<li data-name="' + tag + '" data-count="'+ count + '">';
            li_html += '<a class="tag-name" href="#" data-tag="' + tag + '">' + tag.toUpperCase();
            li_html += '<span class="tag-count">' + count + '</span>';
            li_html += '</a>';
            li_html += '</li>';
        }
        var $tag_list = $('<ul class="tag-list list-unstyled"></ul>').append(li_html);
        var $summary = $("#summary");

        // Remove existing content
        $summary.empty();
        $summary.html($tag_list);

        $("ul.tag-list").click(highlightTagInSource);
    };

    /**
     * Tag click handler which highlight tags in source view.
     * @param {object} e Event object.
     */
    var highlightTagInSource = function(e) {
        if (e.target.className == "tag-name") {
            $(".tag-list .tag-name").removeClass("active");
            var $clicked_tag = $(e.target);
            $clicked_tag.addClass("active");

            var tag_name = $clicked_tag.attr("data-tag");

            // find tag in source view and add highlight
            $(".tag-name").each(function(index, elem) {
                var $this = $(this);
                if ($this.text() == tag_name) {
                    $this.addClass("highlight");
                } else {
                    $this.removeClass("highlight");
                }
            });
        }
    };

    /**
     * Update tag list order when sort criteria is changed.
     * @param {object} e Event object.
     */
    var sortOptionsChange = function(e) {
        var $tag_list = $('.tag-list');
        var $tagli = $tag_list.children('li');
        // 0 - field (name or count), 1 - order (desc or asc)
        var parts = e.target.selectedOptions[0].value.split('_');
        $tagli.sort(function(a, b) {
            var order = parts[1] == 'asc' ? 1 : -1;
            var is_number = parts[0] == "count" ? true : false;
            var ac = a.getAttribute('data-' + parts[0]);
            var bc = b.getAttribute('data-' + parts[0]);
            if (is_number) {
                ac = parseInt(ac);
                bc = parseInt(bc);
            }
            if (ac > bc) {
                return 1 * order;
            } else if (bc > ac) {
                return -1 * order;
            } 
            return 0;
        });
        $tagli.detach().appendTo($tag_list);
    };

    // export public members
    return {
        init: init
    };
})();
