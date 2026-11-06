declare module 'mammoth' {
  export interface RawTextResult {
    value: string
    messages: any[]
  }
  export function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<RawTextResult>
  const mammoth: {
    extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<RawTextResult>
  }
  export default mammoth
}
