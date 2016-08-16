(function() {

    var output = PUBNUB.$('output'), 
        input = PUBNUB.$('input'), 
        button = PUBNUB.$('button'),
        avatar = PUBNUB.$('avatar'),
        presence = PUBNUB.$('presence');

    var channel = 'giphy-chat';
    
    // Assign a random avatar in random color
    avatar.className = 'face-' + ((Math.random() * 13 + 1) >>> 0) + ' color-' + ((Math.random() * 10 + 1) >>> 0);

    var p = PUBNUB.init({
        subscribe_key: 'sub-c-ca9cc472-638e-11e6-ac7d-02ee2ddab7fe',
        publish_key:   'pub-c-c38efdb0-71ef-428b-baef-cfb28c8e9544'
    });


    p.history({
        channel  : channel,
        count    : 50,
        callback : function(messages) {
            p.each( messages[0], function(m){
                var content = '<p><i class="' + m.avatar + '"></i><span>';

                if(m.text) {
                    content += m.text.replace( /[<>]/ig, '' );
                }
                if(m.gif) {
                    console.log('giphy added...');
                    content += '<img src="' + m.gif + '">'
                }
                content += '</span></p>';

                output.innerHTML = content + output.innerHTML; 
            } );
        }
    });

    var actionUser = '';

    p.subscribe({
        channel  : channel,
        callback : function(m, e, c) {
            console.log(m, e, c);  console.log(m);
            actionUser = m.avatar;
            var content = '<p><i class="' + m.avatar + '"></i><span>';

            if(m.text) {
                content += m.text.replace( /[<>]/ig, '' );
            }
            if(m.gif) {
                console.log('giphy added...');
                content += '<img src="' + m.gif + '">'
            }
            content += '</span></p>';

            output.innerHTML = content + output.innerHTML; 
        },
        presence: function(m){ console.log(m);
            if(m.occupancy > 1) {
                presence.textContent = m.occupancy + ' people online';
            } else {
                presence.textContent = 'Only you are online';
            }
            // buggy. I fixed this later.
            
            // if(m.action === 'join') {
            //     var who = (actionUser) ? '<i class="' + actionUser + '"></i>' : '<em>You </em>';
            //     output.innerHTML = '<p>' + who + '<span><em>joined the room</em></span></p>' + output.innerHTML; 
            // }
            // if(m.action === 'leave') {
            //     output.innerHTML = '<p><i class="' + actionUser + '"></i><span><em>left the room</em></span></p>' + output.innerHTML; 
            // }
        }
    });

    p.bind('keyup', input, function(e) {
        if((e.keyCode || e.charCode) === 13) {
            publish();
        }
    });

    p.bind('click', button, publish);

    function publish() {
        var text = input.value;

        if(!text) return;

        p.publish({
            channel : channel, 
            message : {avatar: avatar.className, text: text}, 
            callback : function(m) {
                input.value = '';
                console.log(m);
                if (['\giphy'].some(function(v) { return text.toLowerCase().indexOf(v) > 0; })) {console.log('hi');
                    var query = text.replace('\\giphy ', '').split(' ').join('+');
                    console.log(query);
                    getGiphy(query);
                }
            }
        });
    }

    function publishGif(gif) {
        p.publish({
            channel : channel, 
            message : {avatar: avatar.className, gif: gif}
        });
    }

    function getGiphy(q) {
        var url = 'http://api.giphy.com/v1/gifs/translate?api_key=dc6zaTOxFJmzC&s=' + q;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function(){
            var json = JSON.parse(xhr.response);
            var gif = json.data.images.fixed_height.url;
            console.log(gif);
            publishGif(gif);
        };
        xhr.onerror = function(){
            console.log(e);
        };
        xhr.send();
    }


})();
