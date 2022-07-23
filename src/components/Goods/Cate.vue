<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 
        树形表格 
        data绑定数据
        columns 表格各列的配置
          label:列标题名称
          prop 对应列内容的属性名
          type 类型列，可选值有'template'（自定义列模板）
          template:列类型取'template'（自定义列模板）时，对应的作用域插槽
                    它可以获取到row,rowIndex,column,columnIndex
      -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <!-- {{ scope.row }} -->
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>

        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <!-- {{ scope.row }} -->
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <!-- {{ scope.row }} -->
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="showEditCateDialog(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="removeCateById(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- 
            级联选择器
            当一个数据集合有清晰的层级结构时，可通过级联选择器逐级查看并选择
           只需为 Cascader 的options属性指定选项数组即可渲染出一个级联选择器。
           （options 指定数据源）
           props 用来指定配置对象:
           通过props.expandTrigger可以定义展开子级菜单的触发方式。
            value	指定选项的值为选项对象的某个属性值
            label	指定选项标签为选项对象的某个属性值
            children	指定选项的子选项为选项对象的某个属性值
            v-model 将选中的值双向绑定到data中，v-model必须绑定一个数组，
            不能是一个值或者对象，在本例中，级联选择器可以选择一级和二级两项，
            那么需要把两个id值都存起来，因此需要保存到数组中
            @change 只要级联选择器的选中项发生变化，就会立即触发事件
           -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类的对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      :before-close="editCateDialogClosed"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询条件
      queryInfo: {
        type: 3, //请求列表等级
        pagesize: 5, //每页显示多少条数据
        pagenum: 1 //当前页码值
      },
      //商品分类的数据列表，默认为空
      cateList: [],
      //商品总数
      total: 0,
      //为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          //表示将当前列定义为模板列
          type: 'template',
          //表示当前这一列使用模板名称
          template: 'isok'
        },
        {
          label: '排序',
          //表示将当前列定义为模板列
          type: 'template',
          //表示当前这义列使用模板名称
          template: 'order'
        },
        {
          label: '操作',
          //表示将当前列定义为模板列
          type: 'template',
          //表示当前这义列使用模板名称
          template: 'opt'
        }
      ],
      //控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      //添加分类的表单数据对象
      addCateForm: {
        //将要添加的分类的名称
        cat_name: '',
        //父级分类的Id
        cat_pid: 0,
        //分类的等级默认要添加的是一级分类
        cat_level: 0
      },
      //添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' }
        ]
      },
      //父级分类的列表
      parentCateList: [],
      //指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        //父子不关联
        checkStrictly: true,
        expandTrigger: 'hover'
      },
      //选中的父级分类的id数组
      selectedKeys: [],
      //控制修改分类对话框的显示与隐藏
      editCateDialogVisible: false,
      //修改分类的表单
      editCateForm: {},
      //修改分类表单的验证规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('获取商品分类失败！')
      // console.log(res.data)
      //把数据列表赋值给cateList
      this.cateList = res.data.result
      this.total = res.data.total
      //this.$message.success('获取商品分类成功！')
    },
    //监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    //监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    //点击按钮，展示添加分类的对话框
    showAddCateDialog() {
      //先获取父级分类的数据列表，再展示对话框
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    //获取父级分类的数据列表，调用后端接口，只需要获取前两级分类
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取父级分类数据失败！')
      // console.log(res.data)  //数组（一级二级分类列表）
      this.parentCateList = res.data
    },
    //选择项发生变化触发这个函数
    parentCateChanged() {
      console.log(this.selectedKeys)
      //如果selectKeys 数组中的 length大于0，证明选中了父节分类
      //反之，说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        //永远选择父分类中的最后一个数据
        //父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        //为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        //重置
        this.addCateForm.cat_pid = 0
        //为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    //点击按钮，添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201)
          return this.$message.error('添加分类失败！')
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    //监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },

    //根据用户的id查询到分类名称的旧数据，并且保存起来，供我们在表单中进行填充
    //点击编辑按钮,弹出修改分类的对话框
    async showEditCateDialog(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('查询商品分类信息失败！')
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    //监听修改商品分类对话框的关闭事件
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
      this.editCateDialogVisible = false
    },
    //提交修改分类
    editCateInfo() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return this.$message.error('修改商品分类信息失败！')
        // console.log(this.editCateForm)
        const { data: res } = await this.$http.put(
          'categories/' + this.editCateForm.cat_id,
          { cat_name: this.editCateForm.cat_name }
        )
        // console.log(res)
        if (res.meta.status !== 200)
          return this.$message.error('修改商品分类失败！')
        //关闭对话框
        this.editCateDialogVisible = false
        //刷新列表
        this.getCateList()
        //提示修改成功
        this.$message.success('修改商品分类成功！')
      })
    },
    //根据id删除商品分类
    async removeCateById(id) {
      //弹框询问是否删除分类数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      //发起删除请求
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200)
        return this.$message.error('删除商品分类失败！')
      this.$message.success('删除商品分类成功！')
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
