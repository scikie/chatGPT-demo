<script>
    import { createEventDispatcher } from "svelte";
    import ChatMessage from "./ChatMessage.svelte";
    import UserMessage from "./UserMessage.svelte";
    export let messages = new Array();
    const dispatch = createEventDispatcher();
    export let conversation_id = "";
    $: console.log("[conversation_id]", conversation_id);
    let newMessage = { role: "assistant", content: "" };
    let newQuestion = ""; // 输入框输入的值
    // $:console.log(newQuestion);
    let isVisible = false; // 是否在流式传输时候展示输出
    let sendButtonDisable = false; // 发送按钮是否禁止

    let messagesEl; // 对 id="messages"的div节点的引用
    /*conversationIn
     * 指示正在运行ConversationButtonHandler函数,
     * 解决正在回答问题时候，点击“新建对话”按钮怎么处理的问题
     */
    let conversationIn = false;
    // 滚动到底部的函数
    function scrollToBottom() {
        if (messagesEl) {
            messagesEl.scrollTop = messagesEl.scrollHeight;
        }
    }
    async function sendPostRequest(message) {
        // 先向/chat通过POST发送问题，在通过向/chat/stream?sessionToken=发送GET请求获得回答
        try {
            const response = await fetch("http://localhost:8888/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    conversation_id: conversation_id, // 需要提供正确的会话ID
                    role: "user", // 可以根据实际情况修改角色
                    content: message, // 需要提供正确的内容
                }),
            });

            // 检查响应状态
            if (!response.ok) {
                // 如果响应状态不是 2xx，抛出错误
                const errorText = await response.text();
                throw new Error(
                    `Server error: ${response.status} -${errorText}`,
                );
            }

            // 返回解析后的JSON数据
            return await response.json();
        } catch (err) {
            console.error("sendPostRequest error:", err);
            throw err; // 确保错误被传递到调用者
        }
    }

    // 流式请求chat/stream?sessionToken=
    async function startSSEStream(sessionToken) {
        let chatMessageTokens = new Array();
        let chatMessageSentence = "";
        let lastChunk = "";
        let chunk = "";
        const eventSource = new EventSource(
            "http://localhost:8888/chat/stream?sessionToken=" + sessionToken,
        );

        eventSource.onopen = function (event) {
            console.log("SSE connection opened");
        };

        eventSource.addEventListener(
            "connected",
            function (event) {
                const data = event.data;
                console.log("[connected]:", data);
            },
            false,
        );

        function isEnglish(word) {
            return /^[A-Za-z\s]+$/.test(word);
        }

        function isChinese(word) {
            return /^[\u4e00-\u9fa5]+$/.test(word);
        }

        eventSource.onmessage = function (event) {
            const data = JSON.parse(event.data);
            console.log(data);
            // 在这里处理从服务器接收到的消息
            chunk = data.content ?? "";
            chatMessageTokens.push(chunk);
            // 如果当前词组是英文，并且不是数组的第一个元素，并且前一个词组也是英文，则添加一个空格
            if (isEnglish(chunk) && isEnglish(lastChunk)) {
                chatMessageSentence += " " + chunk;
            } else {
                // 否则，直接添加词组，无需添加额外的空格
                chatMessageSentence += chunk;
            }
            lastChunk = chunk;
            newMessage.content = chatMessageSentence; // 这里是否响应？ TODO
            scrollToBottom();// 滚动到底部
            
        };

        // 返回一个Promise，以便可以在事件流结束时返回消息
        return new Promise((resolve, reject) => {
            eventSource.addEventListener(
                "done",
                function (event) {
                    var data = event.data;
                    console.log("[done]:", data);
                    eventSource.close(); // 关闭连接
                    console.log("SSE connection close");
                    resolve(chatMessageSentence); // 返回累积的消息
                },
                false,
            );

            eventSource.onerror = function (error) {
                console.error("SSE error:", error);
                eventSource.close();
                reject(error);
            };
        });
    }

    // 按下回车键的处理函数
    async function keyDownHandler(event) {
        if (event.key === "Enter" && !sendButtonDisable) {
            console.log("按下了回车键，输入的信息是：", newQuestion);
            await sendButtonHandler();
        }
    }

    async function sendButtonHandler(event) {
        const userMessage = newQuestion.trim(); //把用户输入的值去掉前后空格
        sendButtonDisable = true; // 禁止点击发送按钮，直到发送输入内容成功为止
        conversationIn = false; // 首先设为false如果后续为ture，则必定是“新建对话”引起的。
        // 向服务器发送输入内容，希望得到回答
        try {
            // 响应 response的参数
            // sessionToken	string	提供给客户端通过/chat/stream的get请求获取回答的参数
            // conversation_id	string	本次会话的id
            const response = await sendPostRequest(userMessage);
            // console.log("response.sessionToken:", response);
            if (conversationIn) {
                sendButtonDisable = false;
                return;
            }
            try {
                const sessionToken = response.sessionToken;
                conversation_id = response.conversation_id;
                // 如果请求成功，返回sessionToken，那么把用户输入的问题，添加到聊天记录中去
                messages = [
                    ...messages,
                    { role: "user", content: userMessage },
                ];
                newQuestion = ""; //清空输入框内容
                isVisible = true; //在流式传输时候展示输出
                // chatMessage为AI返回的消息
                const chatMessage = await startSSEStream(sessionToken);
                if (conversationIn) {
                    isVisible = false; //已经新建会话了，不展示“流式输出展示块”
                    newMessage.content = ""; //已经新建会话了，清除“流式输出展示块”内的context
                    sendButtonDisable = false;
                    return;
                }
                isVisible = false; // 流式传输结束，停止展示输出
                newMessage.content = ""; //流式展示块，清除其中内容
                messages = [
                    ...messages,
                    { role: "assistant", content: chatMessage },
                ];
                scrollToBottom();// 滚动到底部
            } catch (error) {
                console.error("Error SSE stream:", error);
                // 这里处理错误，例如显示错误信息给用户
            }
        } catch (error) {
            console.error("Error sending qustion:", error);
            // 这里处理错误，例如显示错误信息给用户
        }
        sendButtonDisable = false;
    }

    function ConversationButtonHandler(event) {
        console.log("ConversationButtonHandler run...");
        conversationIn = true;
        let title;
        if (
            Array.isArray(messages) &&
            messages.length > 0 &&
            messages[0].hasOwnProperty("content")
        ) {
            title = messages[0].content;
            // 根据本次会话的内容来创建一个历史记录，用于添加到侧边栏中去
            const history = { conversation_id, title };
            dispatch("createConversation", history);
            // 将上一会话交流的内容清空
            messages = [];
            // 将上一会话交流的会话id清空
            conversation_id = "";
        } else {
            // TODO  显示提示
        }
    }
</script>

<div class="content">
    <div class="chat-header">GPT助手</div>
    <div class="chat-messages" id="messages" bind:this={messagesEl}>
        <!-- Messages will be displayed here -->
        <div class="message">
            <div class="avatar">
                <img
                    class="avatar-img"
                    src="/assets/image/chat_avatar.png"
                    alt="Avatar"
                />
            </div>
            <div class="chat-content">
                你好，我是GPT小助手，请问有什么可以帮您？
            </div>
        </div>
        {#each messages as message}
            {#if message.role === "user"}
                <UserMessage {message} />
            {:else}
                <ChatMessage {message} />
            {/if}
        {/each}
        <div class={isVisible ? "message" : "hidden"}>
            <div class="avatar">
                <img
                    class="avatar-img"
                    src="/assets/image/chat_avatar.png"
                    alt="Avatar"
                />
            </div>
            <div class="chat-content">
                {newMessage.content}
            </div>
        </div>
    </div>

    <div class="input-box">
        <div>
            <button
                id="conversation-button"
                on:click={ConversationButtonHandler}>新建对话</button
            >
        </div>
        <div class="input-container">
            <input
                type="text"
                placeholder="输入问题..."
                bind:value={newQuestion}
                on:keydown={keyDownHandler}
            />
        </div>
        <div>
            <button
                type="submit"
                id="send-button"
                disabled={!newQuestion || sendButtonDisable}
                on:click={sendButtonHandler}>&#10148;</button
            >
        </div>
    </div>
</div>

<style>
    .content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        max-width: 700px;
    }

    .chat-header {
        padding: 10px;
        border-bottom: 1px solid #eaeaea;
        text-align: center;
    }

    .chat-messages {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding: 15px;
        max-height: 75vh;
        overflow-y: auto;
    }

    .input-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
    }

    #conversation-button {
        border: none;
        background-color: #45454e;
        color: white;
        padding: 10px 15px;
        cursor: pointer;
        border-radius: 5px;
    }

    .input-container {
        width: calc(100% - 150px);
    }

    input[type="text"] {
        width: 100%;
        padding: 10px;
        border: 1px #45454e solid;
        border-radius: 5px;
        box-sizing: border-box;
        /* 使padding不影响整体宽度 */
    }

    #send-button {
        border: none;
        background-color: transparent;
        color: #333;
        padding: 12px;
        cursor: pointer;
        border-radius: 50%;
    }
    #send-button:disabled {
        color: #999;
    }

    .hidden {
        display: none;
    }
</style>
