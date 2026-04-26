<script>
  import Chat from "./components/Chat.svelte";
  import History from "./components/History.svelte";
  let messages = [
    // { role: "user", content: "《未来与我》怎么样？" },
    // {
    //   role: "assistant",
    //   content:
    //     "《未来与我》由四个独立故事组成，每集都设置在一个科幻背景下，但核心却扎根于现实问题：性、宗教与资本、气候危机等一些列社会议题。",
    // },
  ];
  $: console.log("[messages]", messages);
  let conversation_id = "";
  $: console.log("change [conversation_id]", conversation_id);
  let historys = [
    { conversation_id: "1", title: "百年孤独人物关系图谱" },
    {
      conversation_id: "3",
      title:
        "她回顾与沃伦在一起 20多年，为期间的成长感到骄傲，如今都走进了人生新的篇章。",
    },
  ];
  $: console.log("[historys]", historys);
  // 判断historys中是否存在给定conversationId的项
  function isConversationIdExists(conversationId) {
    return historys.some((item) => item.conversation_id === conversationId);
  }
  function createConversation(history) {
    if (history.conversation_id !== "") {
      if (!isConversationIdExists(history.conversation_id)) {
        historys = [...historys, history];
      }
    }
  }
  function updateMessages(msgs) {
    messages = msgs.data;
    conversation_id = msgs.conversation_id;
  }
</script>

<div class="container">
  <History
    bind:historys
    on:updateMessages={(e) => {
      updateMessages(e.detail);
    }}
  />
  <Chat
    {messages}
    {conversation_id}
    on:createConversation={(e) => {
      createConversation(e.detail);
    }}
  />
</div>

<style>
  .container {
    display: flex;
    height: 95vh;
    justify-content: center;
    /* 添加这行代码实现水平居中 */
  }
</style>
