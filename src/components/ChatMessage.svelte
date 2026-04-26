<script>
    export let message;
</script>
<div class="message">
    <div class="avatar">
        <img
            class="avatar-img"
            src="/assets/image/chat_avatar.png"
            alt="Avatar"
        />
    </div>
    <div class="chat-content" style="white-space: pre-wrap;">
        {message.content}
    </div>
</div>

