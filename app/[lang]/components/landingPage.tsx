"use client";

import {
  EasyState,
  GTBasicLandingPage,
  GTInput,
  IGTLandingBenefit,
  IGTLandingFeature,
  IGTLandingNavbar,
  INonNumericMask,
  INumericMask,
  Input,
  SelectionOptions,
  autoUpdateTheme,
} from "@geavila/gt-design";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { Clock, Edit3, Tool } from "react-feather";
import Example from "../../components/Reader/example";

export default function LandingPage({
  params: { lang },
}: {
  params: { lang: string | null };
}) {
  const router = useRouter();

  const navbarOptions: IGTLandingNavbar = {
    logo: "DL",
    button: {
      description: "LANDING_PAGE.LOG_IN",
      onClick: () => router.push(`${lang}/legere`),
    },
    options: [],
  };

  const callToAction = {
    title: "LANDING_PAGE.ACTION.TITLE",
    description: "LANDING_PAGE.ACTION.DESCRIPTION",
    button: {
      onClick: () => router.push(`${lang}/legere`),
      title: "LANDING_PAGE.ACTION.GET_STARTED",
    },
  };

  return (
    <GTBasicLandingPage
      navbarOptions={navbarOptions}
      title="Dissolutus Legere"
      description="LANDING_PAGE.DESCRIPTION"
      benefitDescription="LANDING_PAGE.BENEFITS.DESCRIPTION"
      benefits={Benefits}
      features={Features}
      callToAction={callToAction}
      footerDescription="LANDING_PAGE.FOOTER.DESCRIPTION"
    />
  );
}

const Benefits: IGTLandingBenefit[] = [
  {
    title: "LANDING_PAGE.BENEFITS.ENHANCED_SPEED.TITLE",
    description: "LANDING_PAGE.BENEFITS.ENHANCED_SPEED.DESCRIPTION",
    icon: <Clock />,
  },
  {
    title: "LANDING_PAGE.BENEFITS.IMPROVED_COMPREHENSION.TITLE",
    description: "LANDING_PAGE.BENEFITS.IMPROVED_COMPREHENSION.DESCRIPTION",
    icon: <Tool />,
  },
  {
    title: "LANDING_PAGE.BENEFITS.PERSONALIZED.TITLE",
    description: "LANDING_PAGE.BENEFITS.PERSONALIZED.DESCRIPTION",
    icon: <Edit3 />,
  },
];

const Features: IGTLandingFeature[] = [
  {
    title: "",
    description: "",
    component: <Example />,
  },
];
