import { Component } from 'react';
import filter from 'lodash/filter';
import isEqual from 'lodash/isEqual';

import withOptions from 'hoc/withOptions';
import withTheme from 'hoc/withTheme';

import { getUrl, loadBackground } from 'lib/api';
import removeAllElements from 'utils/removeAllElements';

import FaviconImage from 'assets/images/favicon.png';
import injectElement from 'utils/injectElement';

const OPTION_ID = 'favicon';
const ICON_STORAGE = 'PM_ICON';

@withTheme
@withOptions
class Favicon extends Component {
  updateFavicon = async (accent, useAccent) => {
    const stored = localStorage.getItem(ICON_STORAGE) ? JSON.parse(localStorage.getItem(ICON_STORAGE)) : undefined;

    const cached = stored && stored.accent === accent;
    const data = {
      url: getUrl(FaviconImage),
      accent,
    };

    const createIcon = href => {
      // Remove Old Favicon
      removeAllElements('link[rel="SHORTCUT ICON"], link[rel="shortcut icon"], link[rel="icon"], link[href $= ".ico"]');

      // Create Link Element
      injectElement('link', { id: `play-midnight-${OPTION_ID}`, rel: 'icon', type: 'image/png', href }, 'head');
    };

    if (!useAccent) {
      return createIcon(data.url);
    } else {
      if (cached) {
        createIcon(stored.url);
      } else {
        try {
          const { url } = await loadBackground(data);
          localStorage.setItem(
            ICON_STORAGE,
            JSON.stringify({
              url,
              accent,
            })
          );
          createIcon(url);
        } catch (e) {
          // Console error for now, Modal seems too intrusive for favicon
          console.error(
            `Play Midnight - Issue communcating with background page \
            to update favicon. Refreshing page should fix this.`
          );
        }
      }
    }
  };

  shouldComponentUpdate({ theme: prevTheme, options: prevOptions }) {
    const { theme, options } = this.props;
    const prevFavicon = filter(prevOptions, o => ['favicon', 'faviconAccent'].includes(o.id));
    const favicon = filter(options, o => ['favicon', 'faviconAccent'].includes(o.id));

    return !isEqual(prevTheme.A500, theme.A500) || !isEqual(prevFavicon, favicon);
  }

  render() {
    const { theme, isActive } = this.props;
    const accented = isActive('faviconAccent');

    if (isActive(OPTION_ID)) this.updateFavicon(theme.A500, accented);

    return null;
  }
}

export default Favicon;
