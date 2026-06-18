import React, { Component } from "react";
import Head from "next/head";
import { locale } from "@/app/data/locale";
import { Config } from "@/src/app/constant";

export default class PageHead extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentLocation: null,
    };
  }

  componentDidMount() {
    // Setting the current location once the component is mounted to prevent SSR issues
    const currentLocation = window?.location;
    this.setState({
      currentLocation,
    });
  }

  render() {
    const { currentLocation } = this.state;
    const { title, customTitle, seo } = this.props;

    const refactorTitle =
      locale(customTitle) ||
      Config.appName + (title ? " - " + locale(title) : "");

    return (
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:type" content="website" />

        <title>{refactorTitle}</title>

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Icons for PWA */}
        <link rel="icon" href="/images/illustration/illustration-mascot.png" />
        <link
          rel="apple-touch-icon"
          href="/images/illustration/illustration-mascot.png"
        />

        {/* Meta Tags */}
        <meta name="theme-color" content="#000000" />

        {/* Mobile Compatibility */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Pebbo" />

        {/* Canonical and OG tags */}
        {currentLocation && (
          <>
            <link rel="canonical" href={currentLocation.href} />
            <meta
              name="og:image"
              content={currentLocation.origin + "/favicon.ico"}
            />
            <meta
              property="og:image"
              content={currentLocation.origin + "/favicon.ico"}
            />
            <meta property="og:image:alt" content={refactorTitle} />
            <meta property="og:url" content={currentLocation.href} />
          </>
        )}

        {seo && (
          <>
            <meta
              name="description"
              itemProp="description"
              content={locale(seo?.meta?.description)}
            />
            <meta
              property="og:description"
              content={locale(seo?.meta?.description)}
            />
            <meta
              property="og:title"
              content={locale(seo?.meta?.title)}
              key="title"
            />
          </>
        )}
      </Head>
    );
  }
}
