import { Editor } from '@tinymce/tinymce-react'
import { Editor as TinyMCEEditorInstance } from 'tinymce'
import './index.css'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import Loading from '../loading'
import { handleCopyClick } from '../Dialogue_agent'
import '@/components/MdRender/md.css'
import { asBlob } from 'html-docx-js-typescript'
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'
import Toast from '../Toast'
import { fillContent } from '@/pages/Writing/WritingDetail'
import StyleSetting, { MarginType, StyleKeys, StyleProperties, StyleType, targetDefaultStylesType } from '../StyleSetting'
type TinyMCEEditorProps = {
  onChange?: (content: string) => void
}
/**
 * Converts a given value in centimeters to twips.
 *
 * @param {number} cm - The value in centimeters to be converted.
 * @return {number} The converted value in twips.
 */
export function cmToTwips(cm: number): number {
  const twipsPerInch: number = 1440
  const inchesPerCm: number = 2.54
  return Math.round((cm / inchesPerCm) * twipsPerInch)
}
export function convertObjectValuesToTwips(obj: { [key: string]: number }): { [key: string]: number } {
  const newObj: { [key: string]: number } = {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      newObj[key] = cmToTwips(value)
    }
  }

  return newObj
}
const content_style = `
body {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 14px;
}
`

const TinyMCEEditor = forwardRef(({ onChange }: TinyMCEEditorProps, ref) => {
  const editorRef = useRef<TinyMCEEditorInstance | null>(null)
  const [loading, setLoading] = useState(true) // 加载状态
  // 格式化样式moal显示隐藏
  const [modalVisible, setModalVisible] = useState(false)
  const getStyledHtml = (styles: targetDefaultStylesType) => {
    if (editorRef.current) {
      let content = editorRef.current.getContent()
      const parser = new DOMParser()
      const doc = parser.parseFromString(content, 'text/html')

      Object.keys(styles).forEach((tag) => {
        const style = styles[tag as StyleType]
        doc.querySelectorAll<HTMLElement>(tag).forEach((element) => {
          Object.keys(style).forEach((styleKey) => {
            const key = styleKey as keyof StyleProperties
            const styleValue = style[styleKey as StyleKeys]
            if (key !== undefined && key !== 'title' && key !== 'previewText') {
              // @ts-ignore
              element.style[key] = styleValue
            }
          })
        })
      })

      // 将修改后的 HTML 转换回字符串
      content = doc.body.innerHTML
      return content
    }
    return '' // 如果编辑器未初始化，返回空字符串
  }
  useImperativeHandle(ref, () => ({
    setContent: (content: string) => {
      if (editorRef.current) {
        editorRef.current.setContent(content)
      }
    },
    getContent: () => {
      if (editorRef.current) {
        return editorRef.current.getContent()
      }
      return ''
    },
    getFormatContent: () => {
      if (editorRef.current) {
        return editorRef.current.getContent({ format: 'text' })
      }
      return ''
    }
  }))
  // 一些自定义操作按钮的点击事件
  const handleButtonClick = async (prompt: string) => {
    if (!editorRef.current) return
    const selectedText = editorRef.current.selection.getContent({ format: 'text' })
    if (!selectedText) return

    await fillContent(`${prompt}${selectedText},禁止出现不恰当、多余的引号。`, (content) => {
      editorRef.current?.selection.setContent(content)
    })
  }

  const handleEditorChange = ({ content, editor }: { content: string; editor: TinyMCEEditorInstance }) => {
    onChange && onChange(content)
  }
  const saveToWord = async (styles: targetDefaultStylesType, margin: MarginType) => {
    console.log(styles, convertObjectValuesToTwips(margin))
    const content = getStyledHtml(styles)
    if (!content) return Toast.notify({ type: 'warning', message: '文档内容为空' })
    try {
      const docxBuffer = await asBlob(content, {
        margins: {
          ...convertObjectValuesToTwips(margin)
        }
      })
      const docxBlob = new Blob([docxBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      console.log(docxBlob)

      const match = content.match(/<h1(.*?)>(.*?)<\/h1>/)?.[2]
      const fileName = match ? match : 'document' // 如果没有匹配到，则使用 '默认文件名'
      saveAs(docxBlob, `${fileName} _${dayjs().format('YYYY-MM-DD')}.docx`)
      // 创建 File 对象
      const docxFile = new File([docxBlob], `${fileName}_${dayjs().format('YYYY-MM-DD')}.docx`, { type: docxBlob.type })
      console.log(docxFile, 'file')

      Toast.notify({
        type: 'success',
        message: '文档保存成功'
      })
      setModalVisible(false)
    } catch (error) {
      Toast.notify({
        type: 'error',
        message: '文档保存失败'
      })
      setModalVisible(false)
    }
  }

  return (
    <div className="editor-container h-full relative">
      <StyleSetting open={modalVisible} onClose={() => setModalVisible(false)} onSubmit={saveToWord} />
      {loading && (
        <div id="mask" className="w-full h-full" style={{ position: 'absolute' }}>
          <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            <Loading></Loading>
          </div>
        </div>
      )}
      {/* 显示加载状态 */}
      <Editor
        apiKey="ck9zsnftb0gqb8wtcoi5724vdw44u5j1wixjzu9fmlh5ym64"
        init={{
          language: 'zh_CN',
          inline_boundaries: false,
          menubar: true, // 顶部菜单栏
          resize: false, // 右下角调整大小
          // statusbar: false, // 底部状态栏
          autoresize_on_init: true, // 自动调整大小
          object_resizing: false, // 禁止设置媒体大小
          autosave_interval: '30s', // 自动保存时间
          image_advtab: true, // 高级选项
          branding: false, // 去除底部品牌
          // quickbars_selection_toolbar: 'bold italic | forecolor backcolor | quicklink h2 h3 blockquote quickimage quicktable', // 快速工具栏
          quickbars_selection_toolbar: 'bold italic forecolor backcolor quicklink quickimage quicktable | recommendedSentences recommendedParagraph continuationOfContent rewrite polish expand abbreviation', // 快速工具栏
          image_caption: true,
          default_link_target: '_blank',
          content_style,
          setup(editor) {
            editor.ui.registry.addButton('copyContent', {
              icon: 'copy',
              tooltip: '复制内容',
              onAction: function () {
                const content = editor.getContent({ format: 'text' })
                if (!content) return
                handleCopyClick(content)
              }
            })
            editor.ui.registry.addButton('recommendedSentences', {
              icon: 'ai-prompt',
              tooltip: '推荐句子',
              onAction: () => handleButtonClick('请为以下的内容推荐一个更合适、更生动的句子来替换原句，以增强表达效果:')
            })
            editor.ui.registry.addButton('recommendedParagraph', {
              icon: 'typography',
              tooltip: '推荐段落',
              onAction: () => handleButtonClick('请为以下的内容推荐一个全新段落，要求与原段落主题相关，但表达方式和角度应有所不同，以增加文章的丰富性和深度:')
            })
            editor.ui.registry.addButton('continuationOfContent', {
              icon: 'permanent-pen',
              tooltip: '续写内容',
              onAction: () => handleButtonClick(' 请根据以下的内容，为其续写新的内容，保持原有的主题和风格，同时引入新的观点或信息，使文章更加完整:')
            })
            editor.ui.registry.addButton('rewrite', {
              icon: 'reload',
              tooltip: '章节重写',
              onAction: () => handleButtonClick('请对以下的章节进行重写，要求保持原有的主题和要点，但采用全新的结构和表达方式，以提高文章的质量和吸引力:')
            })
            editor.ui.registry.addButton('polish', {
              icon: 'fill',
              tooltip: '润色',
              onAction: () => handleButtonClick(' 请对以下的内容进行润色，修正语法错误、拼写错误、标点符号使用等问题，并优化句子结构和词汇选择，使文章表达更加精准、流畅、保留原文语言不要进行翻译:')
            })
            editor.ui.registry.addButton('expand', {
              icon: 'text-size-increase',
              tooltip: '扩写',
              onAction: () => handleButtonClick('请对以下的内容进行扩写，增加更多细节、例子或相关观点，以丰富文章的内容，提高文章的深度和广度:')
            })
            editor.ui.registry.addButton('abbreviation', {
              icon: 'text-size-decrease',
              tooltip: '缩写',
              onAction: () => handleButtonClick('请对以下的内容进行缩写，精简语言，去除冗余信息，保留核心观点和关键信息，以使文章更加简洁明了:')
            })
            editor.ui.registry.addButton('downWord', {
              icon: 'save',
              tooltip: '保存文档',
              onAction: async function () {
                setModalVisible(true)
              }
            })
          },
          plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion',
          toolbar: 'undo redo | blocks fontsizeinput | copyContent downWord underline strikethrough image link | align numlist bullist | table media emoticonsss | lineheight outdent indent| removeformat | charmap | code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl ',
          removed_menuitems: 'newdocument',
          formats: {
            alignleft: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'left' },
            aligncenter: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'center' },
            alignright: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'right' },
            alignjustify: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'full' },
            bold: { inline: 'span', classes: 'bold' },
            italic: { inline: 'span', classes: 'italic' },
            underline: { inline: 'span', classes: 'underline', exact: true },
            strikethrough: { inline: 'del' },
            forecolor: { inline: 'span', classes: 'forecolor', styles: { color: '%value' } },
            hilitecolor: { inline: 'span', classes: 'hilitecolor', styles: { backgroundColor: '%value' } },
            custom_format: { block: 'h1', attributes: { title: 'Header' }, styles: { color: 'red' } }
          },
          init_instance_callback: (editor) => {
            setLoading(false) // 当编辑器初始化完成后，关闭加载状态
          }
        }}
        onEditorChange={(content, editor) => handleEditorChange({ content, editor })}
        onInit={(evt, editor) => {
          editorRef.current = editor
        }}
      />
    </div>
  )
})
export default TinyMCEEditor
