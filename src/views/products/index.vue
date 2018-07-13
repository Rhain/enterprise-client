<template>
  <div class="app-container">
    <div class="filter-container">
      <div>
        <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="产品名称" v-model="listQuery.name">
        </el-input>
        <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
      </div>

      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">新增产品</el-button>
    </div>
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="加载中..." border fit highlight-current-row style="width: 100%;">
      <el-table-column align="center" label='ID' width="50">
        <template slot-scope="scope">
          {{scope.row.id}}
        </template>
      </el-table-column>
      <el-table-column width="100" align="center" label="产品名称">
        <template slot-scope="scope">
          {{scope.row.name}}
        </template>
      </el-table-column>
      <el-table-column width="150" align="center" label="图片路径">
        <template slot-scope="scope">
          {{scope.row.img}}
        </template>
      </el-table-column>
      <el-table-column label="产品类别" width="100" align="center">
        <template slot-scope="scope">
          <span v-for="category in categories">
            <template v-if="category.id == scope.row.categoryId">
              {{ category.name }}
            </template>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="产品尺寸" width="100" align="center">
        <template slot-scope="scope">
          <span>
            {{scope.row.size}}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="产品描述" width="150" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.desc}}</span>
        </template>
      </el-table-column>
      <el-table-column label="优先级" width="90" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.order}}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间"  align="center">
        <template slot-scope="scope">
          {{scope.row.updateAt | parseTime('{y}-{m}-{d} {h}:{i}')}}
        </template>
      </el-table-column>
      <el-table-column align="center" width="200" label="操作">
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

        <el-form-item label="产品名称" prop="name">
          <el-input v-model="temp.name"></el-input>
        </el-form-item>
        <el-form-item label="产品类别" prop="categoryId">
          <el-select v-model="temp.categoryId" placeholder="请选择产品分类">
            <el-option v-for="category in categories" :label="category.name" :value="category.id" :key="category.id"></el-option>
          </el-select>
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
        <el-form-item label="产品尺寸" prop="size">
          <el-input  v-model="temp.size"></el-input>
        </el-form-item>
        <el-form-item label="产品描述" prop="size">
          <el-input type="textarea" rows="5"  v-model="temp.desc"></el-input>
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
import { getList, updateProduct, addProduct, deleteProduct } from '@/api/product'
import { getList as getCategories } from '@/api/category'
import { getToken } from '@/utils/auth'
import waves from '@/directive/waves'

export default {
  directives: {
    waves
  },
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
      categoryQuery: {
        page: 1,
        limit: 1000
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
        categoryId: undefined,
        name: '',
        desc: '',
        size: '',
        order: 0,
        img: '',
        updateAt: undefined
      },
      rules: {
        name: [
          { required: true, message: '产品名称不能为空', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '产品类别不能为空', trigger: 'blur' }
        ],
        order: [
          { required: true, message: '优先级不能为空', trigger: 'blur' },
          { validator: validateOrder, trigger: 'blur' }
        ],
        img: [
          { required: true, message: '图片不能为空', trigger: 'blur' }
        ],
        desc: [
          { required: true, message: '产品描述不能为空', trigger: 'blur' }
        ],
        size: [
          { required: true, message: '产品尺寸不能为空', trigger: 'blur' }
        ]
      },
      baseURL: process.env.BASE_API,
      headers: {
        'Authorization': getToken()
      },
      categories: undefined
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
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    uploadSuccess(response) {
      if (response.success) {
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
      this.temp.img = ''
    },
    fetchData() {
      this.listLoading = true
      getList(this.listQuery).then(response => {
        this.list = response.payload.list
        this.total = response.payload.total
        this.listLoading = false
      })
      getCategories(this.categoryQuery).then(response => {
        this.categories = response.payload.list
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
          updateProduct(tempData).then(() => {
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
          addProduct(tempData).then((response) => {
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
        categoryId: undefined,
        name: '',
        desc: '',
        size: '',
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
      this.$confirm('确定删除此产品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteProduct(row.id).then(() => {
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
    justify-content: space-between;
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
