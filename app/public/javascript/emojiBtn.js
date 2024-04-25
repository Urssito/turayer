import {EmojiButton} from '/@joeattardi/emoji-button/dist/index.js';

const picker = new EmojiButton({autoHide: false});
const trigger = document.getElementById("emoji-trigger");

picker.on('emoji', (sel) => {
    document.querySelector('textarea').value += sel.emoji;
});

trigger.addEventListener('click',() => picker.togglePicker(trigger));