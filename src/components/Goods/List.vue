<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索文本输入框  搜索：后台做的模糊匹配-->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格（元）"
          prop="goods_price"
          width="110px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="70px"
        ></el-table-column>
        <el-table-column
          label="商品数量"
          prop="goods_number"
          width="80px"
        ></el-table-column>
        <!-- 希望时间自定义渲染，适用作用域插槽 -->
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">
            <!-- 调用时间格式化过滤器，使时间格式化渲染 -->
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialog(scope.row.goods_id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"             
              @click="removeById(scope.row.goods_id)"
            ></el-button>
           <el-tooltip content="商品详情" placement="top" :enterable="false">
              <el-button
                type="success"
                icon="el-icon-reading"
                size="mini"             
                @click="showDetails(scope.row.goods_id)"
            ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>

    <!-- 修改商品的对话框 -->
    <el-dialog
      title="编辑商品信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 修改商品表单 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editForm.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品分类" prop="goods_cat">
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedKeys"
            :options="catelist"
            :props="cateProps"
            collapse-tags	   
          ></el-cascader>
        </el-form-item>
        <!-- 商品参数 -->
        <el-form-item label="动态参数">
          <el-input v-model="manyTableAttr" disabled></el-input>
        </el-form-item>
        <el-form-item label="静态属性">
          <el-input v-model="onlyTableAttr" disabled></el-input>
        </el-form-item>
        <!-- <el-form-item label="商品简介：" prop="goods_introduce">
            <span  v-html="editForm.goods_introduce" />
        </el-form-item> -->
        <el-form-item label="浮动价格">
          <el-input v-model="addPrice"></el-input>
        </el-form-item>
        <!-- 不可修改部分:移至详情栏 -->
        <!-- <el-form-item label="商品状态" prop="goods_state">
          <el-checkbox-group v-model="checkboxState">
            <el-checkbox label="0" disabled>未通过</el-checkbox>
            <el-checkbox label="1" disabled>审核中</el-checkbox>
            <el-checkbox label="2" disabled>已审核</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="是否为热销品" prop="is_promote">
          <el-switch
            v-model="editForm.is_promote"
            disabled
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </el-form-item>
        <el-form-item label="热销品数量" prop="hot_mumber">
          <el-input v-model="editForm.hot_mumber" disabled></el-input>
        </el-form-item> -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 商品详情抽屉 -->
    <el-drawer
      size="50%"
      title="商品详情"
      :visible.sync="detailVisible"
      ref="detailRef"
      :before-close="handleClose"
    >
      <div class="demo-drawer__content">
        <el-form
          :model="detailForm"
          ref="detailFormRef"
          label-width="110px"
          class="detail"
          label-position="left"
        > 
          <!-- 该情景不需要图片懒加载，仅作练习 -->
          <el-carousel height="600px" v-if="urls.length > 0" :interval="5000" arrow="always">
            <el-carousel-item v-for="(item,index) in urls" :key="index">
              <img class="goods_img" v-lazy="item">
            </el-carousel-item>
          </el-carousel>
          <el-form-item label="商品名称" prop="goods_name">
            <span>{{detailForm.goods_name}}</span>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <span>{{detailForm.goods_price}}</span>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <span>{{detailForm.goods_weight}}</span>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <span>{{detailForm.goods_number}}</span>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cat">
            <span v-for="(item,i) in selectedCate" :key="i">
              <el-tag>{{item}}</el-tag>
              <i v-if="i !== selectedCate.length - 1" class="el-icon-caret-right"></i>
            </span>     
          </el-form-item>
          <!-- 商品参数 -->
          <el-form-item v-if="detailForm.attrs" label="商品参数">
            <el-table
              :data="detailForm.attrs"
              class="table"
              :header-cell-style="{background:'#eef1f6',color:'#606266'}"
              border
              stripe
            >
              <el-table-column label="参数名称" prop="attr_name" />
              <el-table-column label="参数值" prop="attr_value" />
            </el-table>
          </el-form-item>
          <el-form-item label="商品简介" prop="goods_introduce">
            <span class="introduce" v-html="detailForm.goods_introduce" />
          </el-form-item>
          <el-form-item label="商品状态" prop="goods_state">
            <el-tag v-if="detailForm.goods_state === 0">未通过</el-tag>
            <el-tag v-if="detailForm.goods_state === 1">审核中</el-tag>
            <el-tag v-if="detailForm.goods_state === 2">已审核</el-tag>
          </el-form-item>
          <el-form-item label="是否为热销品" prop="is_promote">
            <el-switch
              v-model="detailForm.is_promote"
              disabled
              active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch>
          </el-form-item>
          <el-form-item label="热销品数量" prop="hot_mumber">
            <span>{{detailForm.hot_mumber}}</span>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {debounce} from '../common/common'
export default {
  data() {
    return {
      //查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //商品列表
      goodslist: [],
      //总数据条数
      total: 0,
      //控制修改商品对话框的显示与隐藏
      editDialogVisible: false,
      //修改商品信息表单
      editForm: {
        
      },
      //修改商品信息表单的校验规则对象
      editFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称！', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格！', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量！', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品重量！', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
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
      //级联选择器选中项的Id组合
      selectedKeys: [],
      //复选框选中的组合
      checkboxState:[],
      //动态参数数组
      manyTable:[],
      //静态属性数组
      onlyTable:[],
      manyTableAttr:'',
      onlyTableAttr:'',
      addPrice:0,
      newAttrs:[],
      onlyAttrs:[],
      manyAttrs:[],
      //控制商品详情的显示与隐藏
      detailVisible:false,
      //商品详情表单
      detailForm:{},
      //商品图片地址集合
      urls:[],
      //选中的分类
      selectedCates:'',
      selectedCate:[]
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    //根据分页获取对应的商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取商品列表失败！')
      this.$message.success('获取商品列表成功！')
      console.log(res.data)
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    async removeById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除!')
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除商品失败！')
      this.$message.success('删除商品成功！')
      this.getGoodsList()
    },
    //跳转到添加商品页面
    goAddpage() {
      //编程式导航
      this.$router.push('/goods/add')
    },
    //点击编辑按钮，弹出编辑对话框
    async editDialog(id) {
      this.getCateList()
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`goods/${id}`)
      // console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('获取商品信息失败！')
      this.$message.success('获取商品成功！')
      this.editForm = res.data
      console.log(this.editForm)
      this.selectedKeys = this.editForm.goods_cat.split(',')
      console.log(this.selectedKeys)
      // this.checkboxState.push(this.editForm.goods_state + '')
      // console.log(this.checkboxState)
      //分别把静态属性和动态参数拼起来
      console.log(res.data.attrs);
      if(res.data.attrs.length !== 0) {
        res.data.attrs.forEach(items => {
          //静态属性(没必要保留id)
          if(items.attr_sel === 'only'){
              this.onlyTable.push([items.attr_value,items.attr_id])
              // this.onlyTableAttr = this.onlyTable.join(' ')
              this.onlyAttrs.push(items.attr_value)
          }else if(items.attr_sel === 'many'){
              this.manyTable.push([items.attr_value,items.attr_id])
              this.manyAttrs.push(items.attr_value)
          }
        })
        this.onlyTableAttr = this.onlyAttrs.join(',')
        this.manyTableAttr = this.manyAttrs.join(',')
        this.addPrice = res.data.attrs[0].add_price
        console.log(this.manyTableAttr)
        console.log(this.manyTableAttr)
      }
      
      // console.log(typeof this.editForm.goods_introduce);
      // this.editForm.goods_introduce = this.editForm.goods_introduce.match(/\<p\>(\S*)\<p\>/)[1]
      // console.log(this.editForm.goods_introduce);
    },
    editDialogClosed() {
      //重置表单
      this.$refs.editFormRef.resetFields()
      this.checkboxState = []
      this.selectedKeys = []
      this.manyTable = []
      this.onlyTable = []
      this.onlyAttrs = []
      this.manyAttrs = []
      this.manyTableAttr = ''
      this.onlyTableAttr = ''
      this.newAttrs = []
    },
    editInfo() {
      //提交修改前，进行预校验
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('修改商品信息失败！')
        //处理attrs 处理成数组,数组中包含对象(不能修改，因为需要提供attr_id)
        // console.log(this.onlyTableAttr)
        // console.log(this.manyTableAttr)
        console.log(this.onlyTable);
        console.log(this.manyTable);
        // if(this.onlyTableAttr) newAttr.push({attr_value:this.onlyTable,attr_sel: "only",add_price:this.addPrice})
        // if(this.manyTableAttr) newAttr.push({attr_value:this.manyTable,attr_sel: "many",add_price:this.addPrice})
        if(this.manyTable){
          this.manyTable.forEach(items => {
            this.newAttrs.push({attr_id:items[1],attr_value:items[0],attr_sel: "many",add_price:this.addPrice})
          })
        }
        if(this.onlyTable){
          this.onlyTable.forEach(items => {
            this.newAttrs.push({attr_id:items[1],attr_value:items[0],attr_sel: "only",add_price:this.addPrice})
          })
        }
        const { data: res } = await this.$http.put(
          `goods/${this.editForm.goods_id}`,
          {
            goods_name: this.editForm.goods_name,
            goods_price: this.editForm.goods_price,
            goods_number: this.editForm.goods_number,
            goods_weight: this.editForm.goods_weight,
            goods_cat: this.selectedKeys.join(','),
            attrs:this.newAttrs
          }
        )
        console.log(res)
        if(res.meta.status!==200) return this.$mesage.error('修改商品失败!')
        this.$message.success('修改商品成功!')
        this.editDialogVisible = false
        this.getGoodsList()
      })
    },
    //获取商品分类列表，为级联选择器服务
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('获取商品分类失败！')
      this.catelist = res.data
    },
    //查看商品详情页
    async showDetails(id){
      this.getCateList()
      const { data: res } = await this.$http.get(`goods/${id}`)
      if (res.meta.status !== 200)
        return this.$message.error('获取商品信息失败！')
      this.$message.success('获取商品成功！')
      this.detailForm = res.data
      console.log(this.detailForm);
      this.detailForm.pics.forEach(items => {
        this.urls.push(items.pics_big_url)
      })
      this.selectedKeys = this.detailForm.goods_cat.split(',')
      this.selectedKeys.forEach(async items => {
        const {data:res} = await this.$http.get(`categories/${items}`)
        this.selectedCate.push(res.data.cat_name)
      })
      //分别把静态属性和动态参数拼起来
      console.log(res.data.attrs);
      if(res.data.attrs.length !== 0) {
        res.data.attrs.forEach(items => {
          //静态属性(没必要保留id)
          if(items.attr_sel === 'only'){
              this.onlyAttrs.push(items.attr_value)
          }else if(items.attr_sel === 'many'){
              this.onlyAttrs.push(items.attr_value)
          }
        })
      }
      console.log(this.onlyAttrs);
      console.log(this.manyAttrs);
      console.log('----------------------');
      // this.addPrice = res.data.attrs[0].add_price
      this.detailVisible = true
    },
    //监听抽屉关闭事件
    handleClose(){
      this.$refs.detailFormRef.resetFields()
      this.urls = []
      this.selectedCate = []
      this.onlyAttrs = []
      this.manyAttrs = []
      this.selectedKeys = []
      this.detailVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
  .el-form-item {
      margin-left: 20px;
  }
  // .goods_img {
  //   width: 300px;
  //   height: 300px;
  //   margin-left: 50px;
  // }
  // .el-carousel {
  //   height: 300px;
  //   width: 400px;
  //   margin-bottom: 15px;
  //   margin-left: 50px;
  // }
  .detail {
    color: #606266;
    margin: 0 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .el-form-item {
      margin: 0;
    }
    .table,.el-carousel{
      margin-bottom: 15px;
      .goods_img {
        width: 600px;
        height: 600px;
        margin-left: 100px;
      }
    }
    .introduce{
      margin-top: 15px;
      width: 100%;
    }
  }

</style>
