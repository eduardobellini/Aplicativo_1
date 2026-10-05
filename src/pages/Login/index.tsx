import { Text, View, Image, TextInput } from 'react-native';
import { styles } from './styles';


export default function Login() {
  return (
    <View style={styles.container}>
        <Image
            source={require('../../Assets/logo.png')}
            style={{ width: 100, height: 100 }}
        />
            <Text>Login</Text>
        <View style={styles.boxtop} />
            <Text>Endereço de e-mail</Text>
        <View style={styles.boxmiddle} />
            <Text>Senha</Text>
        <View style={styles.boxbottom} />
    </View>
  );
}
