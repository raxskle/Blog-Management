<!-- <template>
  <el-container class="pageWrap" >
    <div  class="leftside">
      <div class="adminTitle">欢迎回来</div>
      <el-button >新增文章</el-button>
      <el-button >修改已有文章</el-button>
    </div>
    <el-main class="adminContainer">
      <div class="menu">
        <div class="saveToJPEG" @click="savePNG">保存为png</div>
        <div class="saveToString" @click="saveString">保存至剪切板</div>
        <div class="saveToDataBase" @click="saveDataBase">保存至数据库</div>
      </div>
      <div class="mdEditorContainer">
        <div class="mdEditorRaw">
          <div class="articleData">
            <input type="text" placeholder="title" v-model="articleTitle" />
            <input type="text" placeholder="class" v-model="articleClass"/>
            <input type="text" placeholder="tags" v-model="articleTags"/>
          </div>
          <textarea v-model="rawText"></textarea>
        </div>
        <div class="mdEditorHTML"> 
          <div class="mdContentBar" v-html="HTMLText"></div>
        </div>
      </div>    
    </el-main>
  </el-container>
</template> -->

<template>
  <el-container  class="pageWrap" >
    <el-aside  class="leftside">
      <div class="leftsideTitle">欢迎回来</div>
      <div class="time">{{time}}</div>
      <el-button type="primary"  @click="changeModetoNew">新增文章</el-button>
      <el-button type="primary" @click="changeModetoModify">修改已有文章</el-button>

        <el-dialog
          v-model="dialogVisible"
          title="切换为“修改已有文章”"
          :before-close="handleClose"
        >
        <div class="modifySearch">
          <span>根据文章标题查询文章</span>           
          <el-input size="large" class="w-20 m-2"  v-model="titleForSearch" placeholder="输入需要查询的文章标题" /> 
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">Cancel</el-button>
            <el-button @click="confirmSearch">Confirm</el-button>
          </span>                 

        </div>
        </el-dialog>

    </el-aside>
    <el-main  class="adminContainer">
        <el-row  class="demo-border menu">
          <div>{{modeText}}</div>
          <el-row>
            <el-button class="saveToJPEG" @click="savePNG">保存为png</el-button>
            <el-button class="saveToString" @click="saveString">保存至剪切板</el-button>
            <el-button v-if="mode == 1" class="saveToDataBase" @click="saveDataBase">新增文章到数据库</el-button>        
          </el-row>
          <el-row>
            <!-- <el-button v-if="mode == 2"  @click="updateArticle">更新该文章</el-button> -->
            <!-- <el-button v-if="mode == 2" @click="deleteArticle">删除该文章</el-button>  -->
            <el-popconfirm title="确定？" v-if="mode == 2"  @confirm="updateArticle">
              <template #reference>
                <el-button >更新该文章</el-button>
              </template>
            </el-popconfirm>
            <el-popconfirm title="确定？" v-if="mode == 2" @confirm="deleteArticle">
              <template #reference>
                <el-button >删除该文章</el-button>
              </template>
            </el-popconfirm>
          </el-row>
        </el-row>

        <div class="mdEditorContainer">
        <div class="mdEditorRaw">
          <div class="articleData">
            <div>
              <el-input type="text" placeholder="title" v-model="articleTitle" />
              <el-input type="text" placeholder="class" v-model="articleClass"/>              
            </div>
            <el-input  type="text" placeholder="tags" v-model="articleTags"/>
          </div>
          <textarea v-model="rawText"></textarea>
        </div>
        <div class="mdEditorHTML"> 
          <div class="mdContentBar" v-html="HTMLText"></div>
        </div>
      </div>    
    </el-main>
  </el-container>
</template>


<script lang="ts" setup>
import{ marked} from "marked";
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import html2canvas from 'html2canvas';
import { postArticle } from "../network/postArticle";
import { postTags } from "../network/postTags";
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Action } from 'element-plus'
import { ElNotification } from 'element-plus'
import { c1, c2, c3 } from "../value";
import { searchArticle } from "../network/searchArticle"
import turndown from "turndown"
import {changeArticle} from "../network/changeArticle"
import {deleteArtic} from "../network/deleteArticle"
let router = useRouter();


let createTimer = () => {
  let timer = ref<string>((new Date()).toLocaleString());
  setInterval(() => {
    timer.value =  (new Date()).toLocaleString();
  }, 1000);
  return timer;
}
let time = createTimer();

let mode = ref<number>(1);
let modeText = computed(() => {
  return mode.value === 1 ? "写新的文章" : `修改已有文章  id：${articleId.value}`;
})

  
let rawText = ref("");
let HTMLText = ref("");
let articleTitle = ref("");
let articleClass = ref("");
let articleTags = ref("");
let articleId = ref(0);

let token = sessionStorage.getItem("adminToken");
// 有token就能进入当前页面
// （一次页面会话的时间内应该不会过期吧。。。
if (!token) {
  router.replace("/blogadmin");
}
// console.log(token);

watch(rawText, (newval) => {
  HTMLText.value = marked.parse(newval);
  // console.log(HTMLText.value)
})

let savePNG = () => {
  html2canvas((document.querySelector(".mdContentBar") as HTMLElement),{
    useCORS:true,
    allowTaint: true,
    logging: true,
    }).then((canvas)=> {
     	//获得图片的base64
      let dataURL = canvas.toDataURL();
      let dd = document.createElement("a");
      dd.href = dataURL;
      dd.download = "downImg";
      dd.click();
    });
}


let saveString = async () => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(HTMLText.value);
  } else {
    var tag = document.createElement('textarea');
    tag.setAttribute('id', 'cp_jqb_textarea');
    tag.value = HTMLText.value;
    document.getElementsByTagName('body')[0].appendChild(tag);
    (document.getElementById('cp_jqb_textarea') as HTMLInputElement).select();
    document.execCommand('copy');
    (document.getElementById('cp_jqb_textarea') as HTMLInputElement).remove();
  }
  ElMessage({
    message: '成功保存至剪切板',
    duration: 2000,
    type:"success",
  })
}

// 保存数据库，带token
let saveDataBase = async () => {
  if (!articleTitle.value) {
    ElMessage({
      message: '未输入标题',
      duration: 2000,
      type:"warning",
    })

  } else if (!articleClass.value) {
    ElMessage({
      message: '未输入分类',
      duration: 2000,
      type:"warning",
    })

  } else if (articleClass.value!=c1 && articleClass.value!=c2 && articleClass.value!=c3) {
    ElMessage({
      message: '分类输入错误',
      duration: 2000,
      type:"error",
    })
  } else {
    let date = new Date();
    // console.log(`${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`)
    let data = {
      title: articleTitle.value,
      content: HTMLText.value,
      class: articleClass.value,
      tags: articleTags.value,
      time: `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`,
    }
    ElMessage({
      message: '正在上传数据库',
      duration: 2000,
    })
    let rep = await postArticle(data);
    postTags({
      tag:articleTags.value,
    });
    console.log(rep)
    if (rep == "succeed") {
      ElMessage({
      message: '已成功上传！',
        duration: 2000,
        type:"success",
    })
    }

  }


}

let changeModetoNew = () => {
  if (mode.value != 1) {
    
    ElMessageBox.alert('切换为“写新的文章”', '新增文章', {
      // if you want to disable its autofocus
      // autofocus: false,
      confirmButtonText: 'OK',
      callback: (action: Action) => {
        if (action == "confirm") {
          mode.value = 1;   
          articleTitle.value = "";
          rawText.value = "";
          articleClass.value = "";
          articleTags.value = "";
        }

        ElMessage({
          type: 'info',
          duration:2000,
          message: `切换为“写新的文章”：${action}`,
        })
      },
    })    
  }

}

const dialogVisible = ref(false)
let changeModetoModify = () => {
  dialogVisible.value = true;
}
const handleClose = (done: () => void) => {
  ElMessageBox.confirm('确认取消切换为“修改已有文章”?')
    .then(() => {
      done()
    })
    .catch(() => {
      // catch error
    })
}

let titleForSearch = ref("");
let confirmSearch = async () => {
  if (!titleForSearch.value) {
    ElMessage({
          duration:2000,
          message: `不能为空`,
        })
  } else {
    let article = await searchArticle(`title=${titleForSearch.value}`);
    if (!article.length) {
      ElMessage({
          message: `未找到该文章`,        
          duration:2000,
      })
    } else {
      // console.log(article[0].content);
      articleTitle.value = article[0].title;
      articleClass.value = article[0].class;
      articleTags.value = article[0].tags;
      articleId.value = article[0].id;


      //将数据库的html转回md
      let down = new turndown();
      down.addRule('strikethrough', {
        filter: ['pre'],
        replacement: function (content) {
          return '\n```\n' + content + '\n```\n'
        }
      })
      down.addRule('strikethrough', {
        filter: ['h2'],
        replacement: function (content) {
          return '## ' + content 
        }
      })
      down.addRule('strikethrough', {
        filter: ['h1'],
        replacement: function (content) {
          return '# ' + content 
        }
      })
      let md = down.turndown(article[0].content)
      rawText.value = md;

      mode.value = 2;
      dialogVisible.value = false;      

    }

  }
  
}

let updateArticle = async () => {
  const data = {
    title: articleTitle.value,
    content: HTMLText.value,
    class: articleClass.value,
    tags: articleTags.value,
    id: articleId.value,
  }
  let rep = await changeArticle(data);
  if (rep == "succeed") {
    ElMessage({
      message: '成功更新该文章',
      type: 'success',
    })  
  }
}

let deleteArticle = async () => {
  ElMessage({
      message: '正在删除该文章',
    })  
  let rep = await deleteArtic(articleId.value);
  console.log(rep);
  if (rep == "succeed") {
    changeModetoNew();
    ElMessage({
      message: '已成功删除',
      type: 'success',
    })  
  }
}

</script >

<style lang="scss" scoped>


.pageWrap {
  width: 100vw;
  height: 100vh;
  min-width: 800px;
  flex-direction: row;
  justify-content: flex-start;
  position: relative;
}
.leftside {
  width: 150px;
  flex-direction: column;
  background-color: rgb(229, 252, 255);
  .leftsideTitle {
    font-size: 20px;
    margin: auto;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .time {
    font-size: 12px;
    margin: auto;
    margin-bottom: 20px;
  }

  >button {
    width: 80%;
    margin: 10px;
    background-color: rgb(12, 174, 196);
    border: solid 1px rgb(12, 174, 196);
    &:active {
      background-color: rgb(9, 129, 145);
      color: rgb(229, 252, 255);
    }
  }
}


.adminContainer {
  width: 85%;
  min-width: 500px;
  flex-direction: column;

  align-items: center;

  .menu {
    width: 90%;
    justify-content: space-between;
    border-bottom: solid 1px rgb(9, 129, 145);
    padding-bottom: 10px;
  }
}

.mdEditorContainer {
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: auto;



  .mdEditorRaw {
    width: 45%;
    margin-right: 10px;
    height: auto;
    flex-direction: column;
    .articleData {
      margin-top: 20px;
      margin-bottom: 10px;
      width: 100%;
      justify-content: space-evenly;
      flex-direction: column;

      >div {
        width: 90%;
        margin: 5px;
      }
    }
  }

  .mdEditorHTML {
    // margin-top: 20px;
    // margin-bottom: 20px;
    // padding-bottom: 80px;
    width: 50%;
    height:600px;
    overflow: hidden;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;

    .mdContentBar {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      width: 100%;
      height: 600px;
      padding-left: 10px;
      overflow-y: scroll;
      @include themeify {
        color: themed('font-color'); 
      }  
      // padding-left: 10px;
    }
  }


}


textarea {
  width: 100%;
  height: 500px;
  box-sizing: border-box;
  resize: none;
  background-color: rgb(250, 250, 250);
  border-radius: 6px;
  border: solid 1px rgb(162, 162, 162);
  padding: 8px;
  // font-family: "MICROSOFT JHENGHEI";
  font-size: 16px;
  transition: .4s all;
}




.modifySearch {
  flex-direction: column;
  width: 300px;
  // height: 200px;
  >span {
    margin: 20px;
  }
}

.dialog-footer button:first-child {
  margin-right: 10px;
}



</style>