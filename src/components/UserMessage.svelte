<script>
    export let message;
</script>
<div class="message">
    <div class="avatar">
        <img
            class="avatar-img"
            src="/assets/image/user_avatar_light.png"
            alt="Avatar"
        />
    </div>
    <div class="user-content" style="white-space: pre-wrap;">{message.content}</div>
</div>
