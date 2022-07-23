<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      ></el-alert>

      <!--
         步骤条区域
         设置active属性，接受一个 Number，表明步骤的 index，从 0 开始。
         需要定宽的步骤条时，设置space属性即可，它接受Number，单位为px，如果不设置，则为自适应。
         设置finish-status属性可以改变已经完成的步骤的状态。
       -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!--
         tab栏区域
        v-model双向绑定activeIndex字符串，它的值与name对应，表示被激活的标签页
        before-leave 切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换。
        Function(activeName, oldActiveName) activeName:将要进入的标签页 oldActiveName 离开的标签页
        tab-click	 tab被选中时触发
       -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="cateProps"
              ></el-cascader>
            </el-form-item>
            <el-form-item label="商品状态" prop="goods_state">
              <!-- 
                此处使用单选框
                结合el-radio-group元素和子元素el-radio可以实现单选组，在el-radio-group中绑定v-model，
                在el-radio中设置好label即可，无需再给每一个el-radio绑定变量，另外，
                还提供了change事件来响应变化，它会传入一个参数value。 
              --> 
              <el-radio-group v-model="addForm.goods_state">
                <el-radio :label=0>未通过</el-radio>
                <el-radio :label=1>审核中</el-radio>
                <el-radio :label=2>已审核</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="是否为热销品" prop="is_promote">
              <el-switch
                v-model="addForm.is_promote"
                active-color="#13ce66"
                inactive-color="#ff4949"
              >
              </el-switch>
            </el-form-item>
            <el-form-item label="热销品数量" prop="hot_mumber">
              <el-input v-model="addForm.hot_mumber"></el-input>
            </el-form-item>
            <el-form-item label="价格浮动" prop="addPrice">
              <el-input v-model="addForm.addPrice"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >    
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 
              上传图片Upload
              action 图片要上传到的后台API地址
              on-preview 处理预览事件（点击文件列表中已上传的文件时的钩子）  function(file)
              on-remove 文件列表移除文件时的钩子   function(file, fileList)  file：将要被移除的图片信息
              list-type 文件列表的类型 

              上传图片没有使用axios发起ajax请求，因此即使显示图片，也是无效的，返回“无效token”
             headers  设置上传的请求头部，在里面自定义Authorization
             在上传每一张图片的时候，都手动为它指定一个headers请求头，在请求头中包含一个字段属性：Authorization，
             它的值就是保存的token值，这样就为每一次上传图片的Ajax的请求提供了一个token验证
             
             on-success 文件上传成功时的钩子   function(response, file, fileList)	
             其中response:服务器返回的数据  file:文件的信息  fileList:当前上传组件的文件列表
             -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data() {
    return {
      //步骤条默认被激活的索引
      activeIndex: '0',
      //添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        is_promote:false,
        hot_mumber:0,
        //商品所属的分类数组
        goods_cat: [],
        goods_state:0,
        //图片的数组
        pics: [],
        //商品的详情描述
        goods_introduce: '',
        //商品的参数（静态+动态）
        attrs: [],
        goods_state:0,
        addPrice:0
      },
      //添加商品的表单校验对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ],
        hot_mumber:[
          { required: true, message: '请输入热销品数量', trigger: 'blur' }
        ],
        addPrice:[
          { required: true, message: '请输入价格浮动', trigger: 'blur' }
        ]
      },
      //商品分类列表
      catelist: [],
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      //动态参数列表
      manyTableData: [],
      //静态属性列表
      onlyTableData: [],
      //上传图片的URL地址
      uploadURL: 'https://lianghj.top:8888/api/private/v1/upload',
      //图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      //预览图片的URL地址
      previewPath: '',
      previewVisible: false  
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取所有商品数据
    async getCateList() {
      const { data: res } = await this.$http.get(`categories`)
      if (res.meta.status !== 200)
        return this.$message.error('获取商品分类数据失败！')
      // this.$message.success('获取商品分类成功！')
      this.catelist = res.data
      console.log(this.catelist)
    },
    beforeTabLeave(activeName, oldActiveName) {
      // console.log('即将离开的标签页的名字是：' + oldActiveName)
      // console.log('即将进入的标签页的名字是：' + activeName)
      // return false //只要return false就会阻止标签页切换
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3)
        return false
    },
    async tabClicked() {
      console.log(this.activeIndex)
      console.log(this.manyTableData);
      console.log(this.onlyTableData);
      //证明访问的是动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200)
          return this.$message.error('获取动态参数失败！')
        // console.log(res)
        //字符串转数组  
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        // console.log(res.data);
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200)
          return this.$message.error('获取静态属性失败！')
        // console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    //处理图片预览效果
    handlePreview(file) {
      console.log(file)
      // 替换成上传给后台的图片
      this.previewPath = file.response.data.url.replace('http://120.78.137.246', 'https://lianghj.top')
      this.previewVisible = true
    },
    //处理移除图片的操作
    handleRemove(file) {
      console.log(file)
      //1、获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      //2、从pics数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(x => {
        x.pic === filePath
      })
      //3、调用数组的splice方法，把图片信息对象从pics数组中移除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    //监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response)
      //1、拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      //2、将图片信息对象push到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    //添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项！')
        //执行添加的业务逻辑
        //这里会报错，因为级联选择器双向绑定规定的是数组，一旦转成字符串就会报错
        // this.addForm.goods_cat = this.addForm.goods_cat.join(',')
        //深拷贝：把对象重新拷贝一份，两个对象互不相干  loadsh cloneDeep(obj)
        console.log(this.addForm);
        const form = _.cloneDeep(this.addForm) //全新的对象
        form.goods_cat = form.goods_cat.join(',')
        //处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            // add_price: form.addPrice + 0,
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          form.attrs.push(newInfo)
        })
        //处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            // add_price: form.addPrice + 0,
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          form.attrs.push(newInfo)
        })
        console.log(form)
        //与后端接口不一致的地方：是否为热销品无法修改
        const { data: res } = await this.$http.post('goods', {
          goods_name: form.goods_name,
          goods_cat: form.goods_cat,
          goods_price: form.goods_price + 0,
          goods_number: form.goods_number + 0,
          goods_weight: form.goods_weight + 0,
          goods_introduce: form.goods_introduce,
          // pics: form.pics,
          attrs: form.attrs
        })
        // console.log(res)
        if (res.meta.status !== 201)
          return this.$message.error('添加商品失败！')
        this.$message.success('添加商品成功！')
        //编程式导航跳转到商品列表
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) return this.addForm.goods_cat[2]
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.btnAdd {
  margin-top: 15px;
}
</style>
