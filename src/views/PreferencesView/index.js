import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import { withAlert } from 'react-alert';

import EditionPanelContainer from '../../components/EditionPanelContainer';
import ProductPreview from '../../components/ProductPreview';
import CustomDialog from '../../components/CustomDialog';
import CheckboxList from '../../components/CheckboxList';
import SearchBar from '../../components/SerachBar';
import MultiheaderCheckboxList from '../../components/MultiheaderCheckboxList';

const dialogContent = {
  cancelPreferenceEdition: {
    title: 'Cancel preference edition',
    bodyText: 'Are you sure you want to cancel preference edition? If you click YES you will loose all unsaved changes.',
  },
};

const styles = theme => ({
  rightButtonIcon: {
    marginRight: theme.spacing.unit,
  },
  backButton: {
    margin: theme.spacing.unit,
  },
  sectionSubtitle: {
    margin: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 5,
    height: 30,
  },
  productListContainer: {
    height: 600,
    overflow: 'auto',
  },
  productList: {
    marginTop: 30,
  },
  paperContainer: {
    minHeight: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 2,
  },
  gridListContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    marginBottom: theme.spacing.unit * 2,
  },
  gridList: {
    height: 400,
  },
  subheader: {
    width: '100%',
  },
  imageTitle: {
    color: theme.palette.primary.light,
  },
  titleBar: {
    background:
      'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
  },
  textField: {
    width: '100%',
  },
});

class MyProductsView extends React.Component {
  constructor(props) {
    super(props);

    const {
      myAssignedItems,
      otherAssignedItems,
      preferences,
      myDefinedGroups,
    } = this.props;
    let preferenceForItem = null;

    if (myAssignedItems && myAssignedItems[0]) {
      preferenceForItem = preferences.filter(pref => pref.haveProductId === myAssignedItems[0].id);
    }

    this.state = {
      selectedMyProduct: myAssignedItems && myAssignedItems[0],
      selectedOtherProductIds: (preferenceForItem && preferenceForItem[0]
        && preferenceForItem[0].wantedProductsIds) || [],
      selectedGroupIds: (preferenceForItem && preferenceForItem[0]
        && preferenceForItem[0].wantedDefinedGroupsIds) || [],
      preferences,
      myAssignedItems,
      otherAssignedItems,
      myDefinedGroups,
      itemToPreview: null,
      editMode: false,
      openDialog: false,
    };

    this.handleDialogAgree = this.handleDialogAgree.bind(this);
    this.handleDialogDisagree = this.handleDialogDisagree.bind(this);
    this.submitSavePreferences = this.submitSavePreferences.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  // TODO: remove it later
  componentWillReceiveProps(nextProps) {
    if (this.props.myAssignedItems !== nextProps.myAssignedItems) {
      this.setState({ myAssignedItems: nextProps.myAssignedItems });
    }
    if (this.props.otherAssignedItems !== nextProps.otherAssignedItems) {
      this.setState({ otherAssignedItems: nextProps.otherAssignedItems });
    }
  }

  // static getDerivedStateFromProps(props, state) {
  //   console.log('>>> ', props, state);
  //   if (props.myAssignedItems !== state.myAssignedItems) {
  //     return {
  //       myAssignedItems: props.myAssignedItems,
  //       otherAssignedItems: props.otherAssignedItems
  //     };
  //   }
  //   return null;
  // }

  handleChange = (event, name) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  handleSearchBarChange = (event, section1, section2) => {
    const phrase = event.target.value.toUpperCase();
    const updatedList1 = this.props[section1]
      .filter(item => item.name.toUpperCase().includes(phrase));
    const updatedList2 = this.props[section2]
      .filter(item => item.name.toUpperCase().includes(phrase));

    this.setState({
      [section1]: updatedList1,
      [section2]: updatedList2,
    });
  };

  handleToggle(item, name) {
    const currentIndex = this.state[name].indexOf(item.id);
    const newChecked = [...this.state[name]];

    if (currentIndex === -1) {
      newChecked.push(item.id);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    this.setState({ [name]: newChecked });
  }

  handleDialogAgree() {
    const { selectedMyProduct } = this.state;
    const { preferences } = this.props;

    const preferenceForItem = preferences.filter(
      pref => pref.haveProductId === selectedMyProduct.id,
    );

    this.setState({
      openDialog: false,
      selectedOtherProductIds: preferenceForItem.length > 0
        ? preferenceForItem[0].wantedProductsIds : [],
      selectedGroupIds: preferenceForItem.length > 0
        ? preferenceForItem[0].wantedDefinedGroupsIds : [],
      editMode: false,
    });
  }

  handleDialogDisagree() {
    this.setState({
      openDialog: false,
    });
  }

  // TODO: submit preferences and update in store
  submitSavePreferences() {
    const { alert, preferences } = this.props;
    const { selectedMyProduct } = this.state;

    const preferenceForItem = preferences.filter(
      pref => pref.haveProductId === selectedMyProduct.id,
    );

    this.setState({
      selectedOtherProductIds: preferenceForItem[0].wantedProductsIds,
      selectedGroupIds: preferenceForItem[0].wantedDefinedGroupsIds,
      editMode: false,
    });

    alert.show('Successfully modified preferences', { type: 'success' });
  }

  render() {
    const {
      classes,
    } = this.props;
    const {
      selectedOtherProductIds,
      selectedGroupIds,
      selectedMyProduct,
      otherAssignedItems,
      myAssignedItems,
      myDefinedGroups,
      itemToPreview,
      editMode,
      openDialog,
      preferences,
    } = this.state;

    return (
      <EditionPanelContainer edition={this.props.edition} navigationValue="preferences">
        <Grid container spacing={24}>
          <Grid item xs={12} sm={6}>
            <Typography className={classes.sectionSubtitle} component="h1" variant="h5">
              My products
            </Typography>
            <Paper className={classes.paperContainer}>
              <SearchBar onChange={event => this.handleSearchBarChange(event, 'myAssignedItems')} />
              <CheckboxList
                data={myAssignedItems}
                primaryAction={(item) => {
                  const pref = preferences.filter(
                    i => i.haveProductId === item.id,
                  );
                  this.setState({
                    selectedMyProduct: item,
                    selectedGroupIds: (pref.length > 0 && pref[0].wantedDefinedGroupsIds) || [],
                    selectedOtherProductIds: (pref.length > 0 && pref[0].wantedProductsIds) || [],
                  });
                }}
                editMode={editMode}
                selectedWithPrimaryId={[selectedMyProduct.id]}
                secondaryAction={item => this.setState({ itemToPreview: item })}
                selectedWithSecondaryId={itemToPreview && itemToPreview.id}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography className={classes.sectionSubtitle} component="h1" variant="h5">
              Other products
              <IconButton
                onClick={() => this.setState({ editMode: true })}
                color="inherit"
              >
                <Icon>edit</Icon>
              </IconButton>
            </Typography>
            <Paper className={classes.paperContainer}>
              <SearchBar onChange={event => this.handleSearchBarChange(event, 'otherAssignedItems', 'myDefinedGroups')} />
              <MultiheaderCheckboxList
                data={[otherAssignedItems, myDefinedGroups]}
                disabled={!editMode}
                titles={['Other items: ', 'My defined groups: ']}
                currentSelected={[selectedOtherProductIds, selectedGroupIds]}
                onItemClick={[
                  item => this.handleToggle(item, 'selectedOtherProductIds'),
                  item => this.handleToggle(item, 'selectedGroupIds'),
                ]}
                secondaryAction={item => this.setState({ itemToPreview: item })}
                selectedWithSecondaryId={itemToPreview && itemToPreview.id}
              />
              <Typography className={classes.sectionSubtitle} component="h1" variant="body1">
                {`Items assigned: ${
                  (selectedOtherProductIds || []).length + (selectedGroupIds || []).length
                }`}
              </Typography>
              <Grid item xs={12} sm={6}>
                {editMode ? <Button
                  variant="contained"
                  color="primary"
                  className={classes.backButton}
                  onClick={() => this.setState({ openDialog: true })}
                >
                  Cancel
                </Button> : null}
                {editMode ? <Button
                  variant="contained"
                  color="primary"
                  className={classes.backButton}
                  onClick={this.submitSavePreferences}
                >
                  Save
                </Button> : null}
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12}>
            <ProductPreview item={itemToPreview} />
          </Grid>
        </Grid>
        <CustomDialog
          handleDisagree={this.handleDialogDisagree}
          handleAgree={this.handleDialogAgree}
          title={dialogContent.cancelPreferenceEdition.title}
          textBody={dialogContent.cancelPreferenceEdition.bodyText}
          openDialog={openDialog}
        />
      </EditionPanelContainer>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const id = ownProps.match.params.editionId;
  const edition = id ? state.editions.items.filter(e => `${e.id}` === id)[0] : null;
  const otherProduct = state.otherAssignedProducts.productsByEdition[id];
  const preferenceByEdition = state.preferences.preferencesByEdition[id];
  const myProduct = state.myAssignedProducts.productsByEdition[id];
  const definedGroups = state.definedGroups.definedGroupsByEdition[id];

  return ({
    edition,
    otherAssignedItems: (otherProduct && otherProduct.items) || [],
    myAssignedItems: (myProduct && myProduct.items) || [],
    preferences: (preferenceByEdition && preferenceByEdition.preferences) || [],
    myDefinedGroups: (definedGroups && definedGroups.groups) || [],
  });
};

export default withStyles(styles)(withAlert(connect(mapStateToProps, null)(MyProductsView)));
