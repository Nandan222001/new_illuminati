import { useTranslation } from 'react-i18next'

export default function CatalogueLoading() {
  const { t } = useTranslation()
  return <p className="editorial-frame editorial-page" role="status">{t('editorial.catalogue.loading')}</p>
}
