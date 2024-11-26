// 学期列表
export const semesters = ['Fall 2023', 'Spring 2024', 'Fall 2024']

// 学期标签映射
export const semesterMap = {
  'Fall 2023': '2023年秋季学期',
  'Spring 2024': '2024年春季学期',
  'Fall 2024': '2024年秋季学期'
}

// 获取学期的本地化标签
export const getSemesterLabel = (semester) => {
  return semesterMap[semester] || semester
}

// 获取学期选项列表（用于下拉选择）
export const getSemesterOptions = () => {
  return semesters.map(semester => ({
    value: semester,
    label: getSemesterLabel(semester)
  }))
}
