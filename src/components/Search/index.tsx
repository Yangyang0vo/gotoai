import { Tooltip } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import sendIcon from '@/assets/images/send.svg'
import Footer from '../Footer'
import './index.css'
import { FileInfo } from '../Dialogue'
/**
 * Renders the search component.
 *
 * @param {Props} props - The component props.
 * @param {Array} props.fileList - The list of files.
 * @param {Function} props.setFileList - The function to set the file list.
 * @param {string} props.sendValue - The value to send.
 * @param {Function} props.setSendValue - The function to set the send value.
 * @param {Function} props.uploadHandle - The function to handle file upload.
 * @param {Function} props.sendMessage - The function to send a message.
 * @param {boolean} props.messageLoading - Indicates if a message is loading.
 * @param {Function} props.enterMessage - The function to handle enter key press.
 * @return {JSX.Element} The rendered search component.
 */

type Props = {
  fileList: FileInfo[]
  setFileList: (value: FileInfo[]) => void
  sendValue: string
  setSendValue: (value: string) => void
  uploadHandle: (e: React.ChangeEvent<HTMLInputElement> | undefined) => void
  sendMessage: () => void
  messageLoading: boolean
  enterMessage: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  uploadRef: React.RefObject<HTMLInputElement>
  placeholder?: string
  hasUploadBtn?: boolean
}

export default function Search({ fileList, setFileList, sendValue, setSendValue, uploadHandle, sendMessage, messageLoading, enterMessage, uploadRef, placeholder, hasUploadBtn }: Props) {
  return (
    <div className="search-box animate__bounceInUp">
      <div className="search-container">
        <div className="search flex">
          <div className="search-input-box">
            {fileList && fileList.length > 0 && (
              <div className="file-list-box">
                {fileList.map((item) => {
                  return (
                    <div className="file-box" key={item.file_id}>
                      <div className="file">
                        <div className="icon icon-img" style={{ backgroundImage: `url("${item.file_url}")` }}></div>
                        <div className="file-info">
                          <p className="name dot">{item.file_name}</p>
                          <div className="status">
                            <div className="success">
                              <p className="type">{item.type}</p> <p className="size">{item.file_size}</p>
                            </div>
                          </div>
                        </div>
                        <p className="close" onClick={() => setFileList(fileList.filter((i) => i.file_id !== item.file_id))}></p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="input-wrap">
              <div className="input-box-inner">
                <TextArea wrap="off" value={sendValue} onKeyUp={(e) => enterMessage(e)} onChange={(e) => setSendValue(e.target.value)} placeholder={placeholder} autoSize={{ minRows: 1, maxRows: 9 }} />
              </div>
              <div className="search-interactive">
                <div className="upload-image-wrap">
                  {hasUploadBtn && (
                    <Tooltip title={'上传文件'}>
                      <input onChange={(e) => uploadHandle(e)} ref={uploadRef} type="file" style={{ display: 'none' }} multiple />
                      <div
                        className="upload-image-btn"
                        onClick={() => {
                          uploadRef.current?.click()
                        }}
                      ></div>
                    </Tooltip>
                  )}
                </div>
                <div className="search-operation">
                  <div className={`enter ${messageLoading ? 'loading loading-spinner loading-xs' : ''}`} onClick={() => sendMessage()}>
                    <img src={sendIcon} alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 底部copyright */}
        <Footer />
      </div>
    </div>
  )
}
