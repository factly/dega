const React = require('react');
const Uppy = require('@uppy/core');
const AwsS3 = require('@uppy/aws-s3');
const GoogleDrive = require('@uppy/google-drive');
const { Dashboard, DashboardModal, DragDrop, ProgressBar } = require('@uppy/react');
require('@uppy/core/dist/style.css');
require('@uppy/dashboard/dist/style.css');

module.exports = class Media extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showInlineDashboard: false,
    };

    this.uppy = new Uppy({ id: 'uppy1', autoProceed: true, debug: true })
      .use(AwsS3, { endpoint: 'https://master.tus.io/files/' })
      .use(GoogleDrive, { companionUrl: 'http://127.0.0.1:3020' });
  }

  componentWillUnmount() {
    this.uppy.close();
  }

  render() {
    const { showInlineDashboard } = this.state;
    return (
      <div>
        <h1>React Examples</h1>

        <Dashboard
          uppy={this.uppy}
          plugins={['GoogleDrive']}
          metaFields={[{ id: 'name', name: 'Name', placeholder: 'File name' }]}
        />

        <h2>Progress Bar</h2>
        <ProgressBar uppy={this.uppy} hideAfterFinish={false} />
      </div>
    );
  }
};
