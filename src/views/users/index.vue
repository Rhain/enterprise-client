<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">新增用户</el-button>
    </div>
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="加载中..." border fit highlight-current-row>
      <el-table-column align="center" label='ID' width="95">
        <template slot-scope="scope">
          {{scope.row.id}}
        </template>
      </el-table-column>
      <el-table-column width="150" align="center" label="用户名">
        <template slot-scope="scope">
          {{scope.row.username}}
        </template>
      </el-table-column>
      <el-table-column label="电话" width="150" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.phone}}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间"  align="center">
        <template slot-scope="scope">
          {{scope.row.updateAt | parseTime('{y}-{m}-{d} {h}:{i}')}}
        </template>
      </el-table-column>
      <el-table-column label="角色"  align="center">
        <template slot-scope="scope">
          <span>{{scope.row.role | parseRole}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="dialogStatus=='create' ? addRules : rules" ref="dataForm" :model="temp" label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>

        <el-form-item label="用户名" prop="username">
          <el-input v-model="temp.username"></el-input>
        </el-form-item>
        <el-form-item v-if="dialogStatus=='create'" label="密码" prop="password">
          <el-input :type="pwdType" v-model="temp.password"></el-input>
          <span class="show-pwd" @click="showPwd"><svg-icon :icon-class="eyeClass" /></span>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="temp.phone"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select class="filter-item" v-model="temp.role" placeholder="请选择">
            <el-option label="管理员" value="ROLE_ADMIN"></el-option>
            <el-option label="用户" value="ROLE_USER"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getList, updateUser, addUser, deleteUser, checkUsername } from '@/api/user'

export default {
  data() {
    var validateName = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入用户名'))
      } else {
        if (this.updateLastUsername === value && this.dialogStatus === 'update') {
          callback()
          return
        }
        checkUsername(value).then(response => {
          if (response.payload === true) {
            callback(new Error('用户名已经存在'))
          } else {
            callback()
          }
        }).catch(error => {
          callback(new Error(error))
        })
      }
    }
    return {
      list: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        sort: '+id'
      },
      total: 0,
      dialogStatus: '',
      dialogFormVisible: false,
      textMap: {
        update: '更新用户',
        create: '创建用户'
      },
      temp: {
        id: undefined,
        username: '',
        password: '',
        phone: '',
        role: '',
        updateAt: undefined
      },
      rules: {
        username: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ],
        role: [{ required: true, message: '角色不能为空', trigger: 'change' }]
      },
      addRules: {
        username: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { min: 6, max: 200, message: '长度在 6 到 200 个字符', trigger: 'blur' }
        ],
        role: [{ required: true, message: '角色不能为空', trigger: 'change' }]
      },
      pwdType: 'password',
      updateLastUsername: '',
      eyeClass: 'eye'
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getList(this.listQuery).then(response => {
        this.list = response.users.list
        this.total = response.users.total
        this.listLoading = false
      })
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.fetchData()
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.updateLastUsername = row.username
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)

          updateUser(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1)
                this.temp.updateAt = new Date()
                this.list.unshift(this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          addUser(tempData).then((response) => {
            console.log(response)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '新增成功',
              type: 'success',
              duration: 2000
            })
            this.listQuery.page = 1
            this.fetchData()
          })
        }
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        username: '',
        password: '',
        phone: '',
        role: '',
        updateAt: undefined
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    showPwd() {
      if (this.pwdType === 'password') {
        this.pwdType = ''
        this.eyeClass = 'eye-open'
      } else {
        this.pwdType = 'password'
        this.eyeClass = 'eye'
      }
    },
    handleDelete(row) {
      this.$confirm('确定删除此用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser(row.username).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.listQuery.page = 1
          this.fetchData()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .pagination-container {
    margin-top: 30px;
  }
  .filter-container {
    padding-bottom: 10px;
    display: flex;
    justify-content: flex-end;
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 1px;
    font-size: 16px;
    color: #889aa4;
    cursor: pointer;
    user-select: none;
  }
</style>
