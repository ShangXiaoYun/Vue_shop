<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-table 
        :data="rightslist" 
        border 
        stripe
        v-el-table-infinite-scroll="load"
        infinite-scroll-delay="500"
        infinite-scroll-distance="50"
      >
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="authName" label="权限名称"></el-table-column>
          <el-table-column prop="path" label="路径"></el-table-column>
          <el-table-column label="权限等级">
            <!-- 通过作用域插槽的形式自定义权限等级这一列渲染成什么样子 -->
            <template v-slot="scope">
              <!-- {{ scope.row }} -->
              <el-tag v-if="scope.row.level === '0'">一级</el-tag>
              <el-tag type="success" v-else-if="scope.row.level === '1'">
                二级</el-tag
              >
              <el-tag type="warning" v-else>三级</el-tag>
            </template>
          </el-table-column>
      </el-table>
      <el-alert v-if="isflag"
                title="正在努力加载中..."
                type="success"
                center
                show-icon>
        </el-alert>
        <el-alert v-if="isMore"
                title="没有更多啦！"
                type="warning"
                center
                show-icon>
        </el-alert>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //权限列表
      rightslist: [],
      isflag: true,
      isMore: false,
    }
  },
  created() {
    //获取所有权限的列表
    this.getRightsList()
  },
  methods: {
    //获取所有权限列表
    async getRightsList() {
      //发起数据请求
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200)
        return this.$message.error('获取权限列表失败！')
      this.rightslist = res.data
      // console.log(this.rightslist)
    },
    load(){
      this.isMore = true;
      this.isflag = false;
    }
  }
}
</script>

<style lang="less" scoped></style>
