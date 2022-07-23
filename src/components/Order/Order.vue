<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="searchOrder(queryInfo.query)"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表数据 -->
      <el-table :data="orderlist" border stripe @expand-change="showGoods">
        <!-- 展开列 -->
        <el-table-column type="expand" label="" >
          <template slot-scope="scope">
            <el-table
              :data="goodslist"
              border
              style="width: 100%; margin-top: 20px"
            >
              <el-table-column
                width="60"
                prop="goods_id"
                label="商品ID"
              >
              </el-table-column>
              <el-table-column
                label="商品"
                prop="goodsPic"
                width="120"
              >
                <template v-slot="scope">
                    <img :src="scope.row.goodsPic" alt="" width="90" height="90">
                </template>
              </el-table-column>
              <el-table-column
                prop="goodsName"
              >
              </el-table-column>
              <el-table-column
                prop="goods_origin_price"
                label="进价（元）"
                width="100"
              >
              </el-table-column>
              <el-table-column
                prop="goods_price"
                label="售价（元）"
                width="100"
              >
              </el-table-column>
              <el-table-column
                width="80"
                prop="goods_number"
                label="商品数量">
              </el-table-column>
              <el-table-column
                width="130"
                prop="goods_price_sum"
                label="实付商品总价（元）"
              >
              </el-table-column>
            </el-table>
          </template>
          <el-card>
            <!-- 经测试不同order包含的商品是一样的。 -->
            <!-- 每一行代表一种商品 -->
            <el-row v-for="(item,index) in goodslist" :key="index">
              <!-- 商品名称与图片 -->
              <el-col :gutter="16"> 
                <el-image
                  v-if="item.goodsPic !== 'undefined'"
                  style="width: 100px; height: 100px"
                  :src="item.goodsPic"
                ></el-image>
              </el-col>
              <!-- 商品原价和实付价 -->
              <el-col :gutter="3">
              </el-col>
              <!-- 商品数量 -->
              <el-col :gutter="2">
              </el-col>
              <!-- 总价 -->
              <el-col :gutter="3">
              </el-col>
            </el-row>
          </el-card>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <pre>{{scope.row}}</pre>
            <el-tag type="success" v-if="scope.row.pay_status === '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-tooltip content="修改状态" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-edit"
                size="mini"
                @click="changeState(scope.row.order_id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="修改地址" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showBox(scope.row.order_id)"
              ></el-button>
            </el-tooltip>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showProgressBox"
            ></el-button>
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
      >
      </el-pagination>
    </el-card>

    <!-- 修改订单状态的对话框 -->
    <el-dialog
      title="修改订单状态"
      :visible.sync="stateVisible"
      width="50%"
      @close="stateDialogClose"
    >
      <el-form
        :model="stateForm"
        :rules="stateFormRules"
        ref="stateFormRef"
        label-width="100px"
      >
        <el-form-item label="订单编号" prop="order_number">
          <el-input v-model="stateForm.order_number"></el-input>
        </el-form-item>
        <el-form-item label="订单价格" prop="order_price">
          <el-input v-model="stateForm.order_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="支付状态">
          <!-- 
              :label=“1”，表示label的值应为数字1
              label=“1”，表示label的值应为字符串1
           -->
          <el-radio-group v-model="stateForm.pay_status" @change="handleChange">
            <el-radio label="0">未支付</el-radio>
            <el-radio label="1">已支付</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-radio-group v-model="stateForm.order_pay">
            <el-radio label="0">未支付</el-radio>
            <el-radio label="1">支付宝</el-radio>
            <el-radio label="2">微信</el-radio>
            <el-radio label="3">银行卡</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否发货" prop="is_send">
          <el-radio-group v-model="stateForm.is_send" @change="handleChange1">
            <el-radio label="否">未发货</el-radio>
            <el-radio label="是">已经发货</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="stateVisible = false">取 消</el-button>
        <el-button type="primary" @click="editState">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <!-- 修改地址表单 -->
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="cityData"
            v-model="addressForm.address1"
            :props="addressProps"
          >
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <!-- 由于未给出修改地址的接口，也没有解释得到的address与address1、address2的关系，
      推测：里面的cgn_address是详细地址，省市区县是详细地址提取。此处不添加提交修改事件。 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 展示物流进度的对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <!-- 订单详情中发货的订单没有找到其物流单号，因此只能使用测试单号查询物流,
      测试单号为：1106975712662，物流进度以时间轴的形式渲染到对话框中 
      Timeline组件
      -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './city_data2017_element'
import _ from 'lodash'

export default {
  data() {
    return {
      //查询对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      //订单列表
      orderlist: [],
      //控制修改地址对话框的显示与隐藏
      addressVisible: false,
      //修改地址对话框的表单对象
      addressForm: {
        //省市区/县
        address1: [],
        //详细地址
        address2: ''
      },
      //修改地址对话框的表单验证对象
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县！', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址！', trigger: 'blur' }
        ]
      },
      cityData,
      addressProps: {
        expandTrigger: 'hover'
      },
      //订单详情
      orderDetail: {},
      //订单地址
      address: '',
      //控制物流进度对话框的显示与隐藏
      progressVisible: false,
      //物流信息列表
      progressInfo: [],
      orderAll:[],
      stateVisible:false,
      //修改订单状态表单
      stateForm:{
        pay_status:'0',
        order_pay:'0'
      },
      //修改订单状态表单的验证对象
      stateFormRules:{
        order_number:[
          {required : true,  message : "请输入订单编号！", trigger: 'blur' }
        ],
        order_price:[
          {required : true,  message : "请输入订单价格！", trigger: 'blur' }
        ]
      },
      //商品列表
      goodslist:[],

    }
  },

  created() {
    this.getOrderList()
  },

  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('获取订单列表失败！')
      this.orderlist = res.data.goods
      this.total = res.data.total
    },
    //监听分页每页大小变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    //搜索订单
    async searchOrder(info){
      //获取所有的订单编号
      this.orderlist = []
      console.log(this.total);
      const{data:res} = await this.$http.get('orders',{params:{
          pagenum:1,
          pagesize:this.total
        }
      })
      console.log(res);
      this.orderAll = res.data.goods
      // const serchIndex = []
      // res.data.goods.forEach((item,index) => {
      //   if(item.order_number.indexOf(info) != -1){
      //     serchIndex.push(index)
      //   }
      // })
      // serchIndex.forEach(item => {
      //   this.orderlist.push(this.orderAll[item]) 
      // })
      // console.log(this.orderlist);
      
      //还可以使用filter和match相结合实现搜索功能
      //其中filter  对数组每一项都运行传入的函数，函数返回true的项目会组成数组之后返回
      //match 与indexOf() 和 lastIndexOf()类似，但是它返回指定的值，而不是字符串的位置。
      this.orderlist = this.orderAll.filter(item => {
        return item.order_number.match(info)
      })
      //或者在computed中计算也可以，这里不复现了
    },
    //展示修改状态的对话框
    async changeState(id){
      //根据id获取订单信息
      const { data: res } = await this.$http.get(`orders/${id}`)
      // console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('获取订单详情失败！')
      this.stateForm = res.data
      // console.log(this.stateForm)
      this.stateVisible = true
    },
    //提交状态修改：订单编号 发货和支付状态在后台写死了
    async editState(){
      // console.log(this.stateForm);
      const {data:res} = await this.$http.put(`orders/${this.stateForm.order_id}`,this.stateForm)
      // console.log(res,'-------')
      if(res.meta.status !== 201) return this.$message.error('修改订单失败！') 
      //修改成功则刷新订单
      this.getOrderList()
      this.$message.success('修改订单成功！')
      //关闭修改订单状态对话框
      this.stateVisible = false
    },
    handleChange(){
      //检测到绑定的值变化，但是提交修改订单不变化，后台写死
      console.log(this.stateForm.pay_status);
    },
    handleChange1(){
      console.log(this.stateForm.is_send);
    },
    //监听修改订单状态对话框的关闭
    stateDialogClose(){
      //表单重置
      this.$refs.stateFormRef.resetFields()
    },
    //展示修改地址对话框
    async showBox(id) {
      //获取订单地址信息(查看订单详情)
      const { data: res } = await this.$http.get(`orders/${id}`)
      console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('获取订单详情失败！')
      this.orderDetail = res.data
      this.address = res.data.consignee_addr //对该地址未作解释
      //也没有给出修改地址接口
      this.addressVisible = true
    },
    addressDialogClosed() {
      this.$ref.addressFormRef.resetFields()
      this.orderDetail = {}
      this.address = ''
      this.addressForm = {
        address1: [],
        address2:''
      }
    },
    async showProgressBox() {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      // console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('获取物流进度失败！')
      this.progressInfo = res.data
      // console.log(this.progressInfo)
      this.progressVisible = true
    },
    //展示商品
    async showGoods(row){
      console.log(row,',,,,,,,,,,,,,,,');
      //通过id获取订单数据
      console.log(row.order_id);
      const {data:res} = await this.$http.get(`orders/${row.order_id}`)
      console.log(res);
      if(res.meta.status !== 200) return this.$message.error('获取商品失败！')
      this.goodslist = res.data.goods
      console.log(this.goodslist);
      
      //获取用户信息 user_id  经检验所有user_id = 1，不存在
      // const {data:res1} = await this.$http.get(`users/${row.user_id}`)
      // console.log(res1); 
      //根据商品id获取商品详情
      let goods_price_sum ,goods_origin_price = 0
      let goodsName ,goodsPic= ''
      let arr = _.cloneDeep(this.goodslist)
      arr.forEach(async item => {
        goods_price_sum = item.goods_number * item.goods_price
        Object.assign(item,{goods_price_sum:goods_price_sum})
        const {data:res} = await this.$http.get(`goods/${item.goods_id}`)
        console.log(res,'---------');
        if(res.meta.status !== 200) return this.$message.error('获取商品信息失败！')
        goodsName = res.data.goods_name 
        Object.assign(item,{goodsName:goodsName})
        goods_origin_price = res.data.goods_price
        Object.assign(item,{goods_origin_price:goods_origin_price})
        goodsPic = res.data.pics[0].pics_sma_url
        Object.assign(item,{goodsPic:goodsPic})
      }) 
      
      setTimeout(() => {
        console.log(arr,'xxxxxxxxxxxx');
        console.log(arr[0].goods_price,this.goodslist[0].goods_price_sum);
        console.log(arr[0].goodsName);
        console.log(arr[0].goods_origin_price);
        this.goodslist = arr;
        console.log(this.goodslist);
      },500)
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
