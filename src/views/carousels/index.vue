<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">新增轮播图</el-button>
    </div>
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="加载中..." border fit highlight-current-row>
      <el-table-column align="center" label='ID' width="95">
        <template slot-scope="scope">
          {{scope.row.id}}
        </template>
      </el-table-column>
      <el-table-column width="150" align="center" label="轮播图名称">
        <template slot-scope="scope">
          {{scope.row.name}}
        </template>
      </el-table-column>
      <el-table-column width="150" align="center" label="图片路径">
        <template slot-scope="scope">
          {{scope.row.img}}
        </template>
      </el-table-column>
      <el-table-column label="产品ID" width="100" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.productId}}</span>
        </template>
      </el-table-column>
      <el-table-column label="优先级" width="150" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.order}}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间"  align="center">
        <template slot-scope="scope">
          {{scope.row.updateAt | parseTime('{y}-{m}-{d} {h}:{i}')}}
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
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="100px" style='width: 400px; margin-left:50px;'>

        <el-form-item label="轮播图名称" prop="name">
          <el-input v-model="temp.name"></el-input>
        </el-form-item>
        <el-form-item label="图片路径" prop="img">
          <el-input size="mini" readonly="true" v-model="temp.img"></el-input>
          <el-upload
            ref="uploadRef"
            class="upload-img"
            drag
            :headers="headers"
            :action="uploadUrl"
            :on-success="uploadSuccess"
            :on-error="uploadError"
            :on-remove="removeImg"
            :multiple="false">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="产品ID">
          <el-input type="number" v-model="temp.productId"></el-input>
        </el-form-item>
        <el-form-item label="优先级" prop="order">
          <el-input type="number" v-model="temp.order"></el-input>
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
import { getList, updateCarousel, addCarousel, deleteCarousel } from '@/api/carousel'
import { getToken } from '@/utils/auth'

export default {
  data() {
    var validateOrder = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入优先级'))
      } else {
        if (Number.isInteger(parseInt(value))) {
          callback()
        } else {
          callback(new Error('优先级必须是数字'))
        }
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
        update: '更新轮播图',
        create: '创建轮播图'
      },
      temp: {
        id: undefined,
        name: '',
        order: 0,
        img: '',
        updateAt: undefined
      },
      rules: {
        name: [
          { required: true, message: '轮播图名称不能为空', trigger: 'blur' }
        ],
        order: [
          { required: true, message: '优先级不能为空', trigger: 'blur' },
          { validator: validateOrder, trigger: 'blur' }
        ],
        img: [
          { required: true, message: '图片不能为空', trigger: 'blur' }
        ]
      },
      baseURL: process.env.BASE_API,
      headers: {
        'Authorization': getToken()
      }
    }
  },
  created() {
    this.fetchData()
  },
  computed: {
    uploadUrl: function() {
      return this.baseURL + 'api/file/upload'
    }
  },
  methods: {
    uploadSuccess(response) {
      if (response.success) {
        console.log('file:' + response.fileName)
        this.temp.img = response.fileName
        this.$refs['dataForm'].validateField('img')
      } else {
        this.$message.error(`文件上传异常`)
      }
    },
    uploadError(err) {
      this.$message.error(`文件上传异常 ${err}`)
    },
    removeImg() {
      console.log('remove img')
      this.temp.img = ''
    },
    fetchData() {
      this.listLoading = true
      getList(this.listQuery).then(response => {
        this.list = response.payload.list
        this.total = response.payload.total
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
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
        this.$refs['uploadRef'].clearFiles()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateCarousel(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.temp.updateAt = new Date()
                this.list.splice(index, 1, this.temp)
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
          addCarousel(tempData).then((response) => {
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
        name: '',
        order: '',
        img: '',
        updateAt: undefined
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
        this.$refs['uploadRef'].clearFiles()
      })
    },
    handleDelete(row) {
      this.$confirm('确定删除此轮播图, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCarousel(row.id).then(() => {
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

<style rel="stylesheet/scss" lang="scss">
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


  .upload-img{
    .el-upload-dragger{
      width: 300px !important;
    }
    .el-upload__tip{
      line-height: 1.47;
    }
  }


</style>
