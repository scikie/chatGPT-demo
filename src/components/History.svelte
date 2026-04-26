<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    export let historys;
    let activeId = null; // 用于追踪当前选中的链接的conversation_id
    function handleClick(event, conversation_id) {
        event.preventDefault();
        activeId = conversation_id; // 更新当前选中的链接的ID
        fetch(
            `http://localhost:8888/history?conversation_id=${conversation_id}`,
        )
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error(
                        "Server responded with status: " + response.status,
                    );
                }
            })
            .then((data) => {
                console.log(
                    `geting conversation_id=${conversation_id} history:`,
                    data,
                );
                // data参数定义:
                // {"conversation_id": conversation_id, "data": messages}
                // 其中messages是App.svelte中定义的类型一样
                if (
                    data &&
                    data.data &&
                    Array.isArray(data.data) &&
                    data.hasOwnProperty("conversation_id")
                ) {
                    dispatch("updateMessages", data);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
</script>

<div class="sidebar">
    <div class="chat-header"><span>历史记录</span></div>
    <div class="historys" id="historys">
        <!-- Historys will be displayed here -->
        <div class="historys" id="historys">
            {#each historys as history (history.conversation_id)}
                <a
                    href="http://localhost:8888/history?conversation_id={history.conversation_id}"
                    class="history-chat"
                    class:selected={activeId === history.conversation_id}
                    on:click={(event) =>
                        handleClick(event, history.conversation_id)}
                >
                    <div class="history-chat-info">
                        <h6 class="history-chat-title" title={history.title}>
                            {history.title}
                        </h6>
                    </div>
                </a>
            {/each}
        </div>
    </div>
</div>

<style>
    @media screen and (min-width: 640px) {
        .sidebar {
            width: 200px;
            text-align: center;
            border-radius: 4px 0px 0px 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            overflow-y: scroll;
        }
    }
    @media screen and (max-width: 639px) {
        .sidebar {
            display: none;
        }
    }
    .chat-header {
        padding: 10px;
        border-bottom: 1px solid #eaeaea;
        text-align: center;
    }
    .history-chat {
        padding: 8px;
        cursor: pointer;
        border-radius: 8px;
        transition: box-shadow 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
        display: flex;
        flex-direction: column;
        text-decoration: none;
        color: inherit;
    }

    /* 当鼠标悬停在元素上时，应用盒阴影 */
    .history-chat:hover {
        box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.2);
    }

    .history-chat-info {
        display: flex;
        align-items: center;
    }

    .history-chat-title {
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0 4px;
        white-space: nowrap;
    }

    .history-chat.selected {
        /* 选中的链接样式 */
        color: #fff; /* 示例：改变文字颜色 */
        font-weight: bold; /* 示例：加粗文字 */
        background-color: #45454e;
    }
</style>
