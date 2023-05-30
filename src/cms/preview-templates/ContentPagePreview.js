import React from 'react'
import PropTypes from 'prop-types'
import { ContentPageTemplate } from '../../templates/content-page'

const ContentPagePreview = ({ entry, getAsset, widgetFor }) => {
  return (
    <ContentPageTemplate
      title={entry.getIn(['data', 'title'])}
      content={widgetFor('body')}
    />
  )
}

ContentPagePreview.propTypes = {
  entry: PropTypes.shape({
    getIn: PropTypes.func,
  }),
  getAsset: PropTypes.func,
}

export default ContentPagePreview
