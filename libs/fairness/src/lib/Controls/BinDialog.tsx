// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Checkbox,
  DefaultButton,
  PrimaryButton,
  SpinButton,
  Text
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { INumericRange, RangeTypes } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import React from "react";

import { BinnedResponseBuilder } from "../util/BinnedResponseBuilder";
import { IBinnedResponse } from "../util/IBinnedResponse";

import { BinDialogStyles } from "./BinDialog.styles";

export interface IBinDialogProps {
  range: INumericRange;
  bins: IBinnedResponse;
  dataset: any[][];
  index: number;
  onSave: (bins: IBinnedResponse) => void;
  onCancel: () => void;
}

export class BinDialog extends React.PureComponent<
  IBinDialogProps,
  IBinnedResponse
> {
  private static minBins = 1;
  private static maxBins = 30;

  public constructor(props: IBinDialogProps) {
    super(props);
    this.state = _.cloneDeep(props.bins);
  }

  public render(): React.ReactNode {
    const styles = BinDialogStyles();
    return (
      <div className={styles.frame}>
        <Text variant={"xLargePlus"} className={styles.header}>
          {localization.Fairness.BinDialog.header}
        </Text>
        <div className={styles.main}>
          <div className={styles.controls}>
            {this.props.range.rangeType === RangeTypes.Integer && (
              <Checkbox
                label={localization.Fairness.BinDialog.makeCategorical}
                checked={this.state.rangeType === RangeTypes.Categorical}
                onChange={this.toggleCategorical}
              />
            )}
            {this.state.rangeType !== RangeTypes.Categorical && (
              <div className={styles.binCounter}>
                <SpinButton
                  styles={{
                    labelWrapper: { alignSelf: "center" },
                    root: {
                      display: "inline-flex",
                      float: "right",
                      selectors: {
                        "> div": {
                          maxWidth: "108px"
                        }
                      }
                    },
                    spinButtonWrapper: { maxWidth: "98px" }
                  }}
                  label={localization.Fairness.BinDialog.numberOfBins}
                  min={BinDialog.minBins}
                  max={BinDialog.maxBins}
                  value={this.state.array.length.toString()}
                  onIncrement={this.setBinCount.bind(this, 1)}
                  onDecrement={this.setBinCount.bind(this, -1)}
                  onValidate={this.setBinCount.bind(this, 0)}
                />
              </div>
            )}
          </div>
          <Text>{localization.Fairness.BinDialog.categoryHeader}</Text>
          <div className={styles.scrollArea}>
            {this.state.labelArray.map((val, i) => {
              return (
                <div className={styles.groupLabel} key={i}>
                  {val}
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.buttons}>
          <PrimaryButton
            className={styles.saveButton}
            text={localization.Fairness.BinDialog.save}
            onClick={this.onSave}
          />
          <DefaultButton
            className={styles.cancelButton}
            text={localization.Fairness.BinDialog.cancel}
            onClick={this.props.onCancel}
          />
        </div>
      </div>
    );
  }

  private readonly onSave = (): void => {
    this.props.onSave(this.state);
  };

  private readonly toggleCategorical = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean
  ): void => {
    if (checked) {
      this.setState(
        BinnedResponseBuilder.buildCategorical(
          this.props.range,
          this.props.index,
          this.props.dataset
        )
      );
    } else if (this.props.bins.rangeType === RangeTypes.Integer) {
      this.setState(this.props.bins);
    } else {
      this.setState(
        BinnedResponseBuilder.buildNumeric(
          this.props.range,
          this.props.index,
          this.props.dataset
        )
      );
    }
  };

  private readonly setBinCount = (
    delta: number,
    stringVal: string
  ): string | void => {
    if (delta === 0) {
      const number = +stringVal;
      if (
        !Number.isInteger(number) ||
        number > BinDialog.maxBins ||
        number < BinDialog.minBins
      ) {
        return this.state.array.length.toString();
      }
      this.setState(
        BinnedResponseBuilder.buildNumeric(
          this.props.range,
          this.props.index,
          this.props.dataset,
          number
        )
      );
    } else {
      const prevVal = this.state.array.length;
      const binCount = prevVal + delta;
      if (binCount > BinDialog.maxBins || binCount < BinDialog.minBins) {
        return prevVal.toString();
      }
      this.setState(
        BinnedResponseBuilder.buildNumeric(
          this.props.range,
          this.props.index,
          this.props.dataset,
          prevVal + delta
        )
      );
    }
  };
}
