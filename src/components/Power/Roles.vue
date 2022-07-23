<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 添加角色列表区 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <!-- 作用域插槽获取角色权限数据 
          children是一个数组，循环children可以得到一个一级权限，
          每个一级权限又有一个children属性，循环可以得到一个二级权限，
          循环二级权限的children属性可以获得三级权限，三级权限children属性为空
          -->
          <template v-slot="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 设置closable属性可以定义一个标签是否可移除。
                    默认的标签移除时会附带渐变动画，如果不想使用，
                    可以设置disable-transitions属性，它接受一个Boolean，true 为关闭。 -->
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{ scope.row }}
           </pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRole(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        ref="addRoleFormRef"
        :model="addRoleForm"
        :rules="addRoleFormRules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        ref="editRoleFormRef"
        :model="editRoleForm"
        :rules="editRoleFormRules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @slose="setRightDialogClosed"
    >
      <!--
         树形控件
         :data完成数据绑定，:props为整棵树指定数据绑定的字段
       -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有角色列表数据
      rolelist: [],
      //添加角色对话框的可见性
      addDialogVisible: false,
      //添加角色的表单数据
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      //添加角色表单的验证规则对象
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '角色名的长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 3,
            max: 15,
            message: '角色描述的长度在3 到 15 个字符',
            trigger: 'blur'
          }
        ]
      },
      //编辑角色对话框的可见性控制
      editDialogVisible: false,
      //编辑角色的表单数据(查询到的角色信息对象)
      editRoleForm: {},
      //修改角色表单的验证规则对象
      editRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '角色名的长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 3,
            max: 15,
            message: '角色描述的长度在3 到 15 个字符',
            trigger: 'blur'
          }
        ]
      },
      //控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      //所有权限的数据
      rightslist: [],
      //树形控件的属性绑定对象
      // label 属性定义页面显示的属性：这里是 authName
      //children 属性定义父子嵌套的属性，这里是 children
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      //默认选中的节点Id值数组
      defKeys: [],
      //当前即将分配权限的角色id
      roleId: '',
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200)
        return this.$message.error('获取角色列表失败')
      this.rolelist = res.data
      // console.log(this.rolelist)
    },
    //点击确定按钮，添加新角色
    addRole() {
      this.$refs.addRoleFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        //发起添加角色请求
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201)
          return this.$message.error('添加角色失败！')
        this.$message.success('添加角色成功！')
        //重新获取列表数据
        this.getRolesList()
        //隐藏添加角色的对话框
        this.addDialogVisible = false
      })
    },
    //监听对话框的关闭事件，对话框关闭时需要重置添加角色的表单
    //这样下次再添加角色的时候弹出的对话框就是一个空表单，不会包含上次表单信息
    addDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },

    //监听编辑对话框的关闭事件，进行表单重置操作
    editDialogClosed() {
      this.$refs.editRoleFormRef.resetFields()
    },
    //根据id查询对应的角色，并渲染到修改角色对话框的表单中
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      // console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('获取角色信息失败！')
      this.editRoleForm = res.data
      // console.log(this.editRoleForm)
      this.editDialogVisible = true
    },
    //修改角色信息并提交
    editRoleInfo() {
      this.$refs.editRoleFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return this.$message.error('修改角色信息失败！')
        // console.log(this.editRoleForm)
        const { data: res } = await this.$http.put(
          'roles/' + this.editRoleForm.roleId,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
          }
        )
        // console.log(res)
        if (res.meta.status !== 200)
          return this.$message.error('修改角色信息失败！')
        this.editDialogVisible = false
        //重新获取角色列表
        this.getRolesList()
        this.$message.success('修改角色信息成功！')
      })
    },
    //点击删除按钮时，弹框提醒，防止误删除
    async deleteRole(id) {
      //如果没有错误捕获，那么点击取消按钮时会报错，而不会返回cancel
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') return this.$message.info('取消了删除！')
      //否则确认删除，发起删除角色请求
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败！')
      this.$message.success('删除角色成功!')
      //重新刷新角色列表
      this.getRolesList()
    },
    //根据id 删除对应的权限
    async removeRightById(role, rightId) {
      //弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消了删除！')
      //发起删除角色权限的业务请求
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )             
      if (res.meta.status !== 200)
        return this.$message.error('删除角色权限失败！')
      //如果重新获取角色列表，那么每删除一次，列表都会重新渲染一次
      //响应数据说明：返回的data,是当前角色下最新的权限数据
      //这里充分体现了vue的响应式原理
      // console.log(res.data);
      role.children = res.data
      //针对删除三级或二级权限，高一级权限不清除，做额外处理
      res.data.forEach(async node => {
        //针对二级权限为0，而一级权限仍存在的情况，把一级权限删除
        if(node.children.length == 0){
          //删除该节点
          const { data: res1 } = await this.$http.delete(
            `roles/${role.id}/rights/${node.id}`
          )
          role.children = res1.data
        }else if(node.children.length != 1){
          //针对三级权限为0 而二级权限不为0的情况， 删除二级权限
          node.children.forEach(async child =>{
            if(child.children.length == 0){
              const { data: res2 } = await this.$http.delete(
                `roles/${role.id}/rights/${child.id}`
              )
              role.children = res2.data
            }
          })
        }
        else{
          //针对一级权限只有一个二级权限，当二级权限下没有三级权限时，一级、二级权限全部清除
          if(node.children[0].children.length == 0){
            //删除该节点
            const { data: res3 } = await this.$http.delete(
              `roles/${role.id}/rights/${node.id}`
            )
            role.children = res3.data
          }
        }
        // console.log(role.children);
      })  
    },
    //展示分配权限的对话框
    /*
    在弹出对话框的同时立即把所有权限的数据以一个树型结构保存到data中，供页面使用
    */
    async showSetRightDialog(role) {
      this.roleId = role.id
      //获取所有权限的数据（树型）
      const { data: res } = await this.$http.get('rights/tree')
      // console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('获取权限数据失败！')
      //把获取到的权限数据保存到data 中
      this.rightslist = res.data
      // console.log(this.rightslist)
      //递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)
      // console.log(this.defKeys);
      this.$message.success('获取权限数据成功！')
      this.setRightDialogVisible = true
    },
    //通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys 数组中
    getLeafKeys(node, arr) {
      //如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    //监听分配权限对话框的关闭事件
    //当对话框关闭时，清空上个角色的权限数据，否则会出现权限叠加效果
    setRightDialogClosed() {
      this.defKeys = []
    },
    //分配角色权限
    async allotRights() {
      //获取全选中和半选中的id值
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) return this.$message.error('分配权限失败！')
      this.$message.success('分配权限成功！')
      //刷新权限列表
      this.getRolesList()
      //关闭分配权限对话框
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  //纵向上的居中对齐
  display: flex;
  align-items: center;
}
</style>
