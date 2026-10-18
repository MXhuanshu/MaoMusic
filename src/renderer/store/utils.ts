import { qualityList } from './index'

export const assertApiSupport = (source: LX.Source): boolean => {
  return source == 'local' || qualityList.value[source] != null
}
