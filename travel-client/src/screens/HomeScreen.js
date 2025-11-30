import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { 
  Text, 
  Card, 
  Searchbar,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import BlindBoxModal from '../components/BlindBoxModal';

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [blindBoxVisible, setBlindBoxVisible] = useState(false);

  // 搜索
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('提示', '请输入目的地');
      return;
    }
    console.log('搜索:', searchQuery);
    navigation.navigate('Generating', {
      destination: searchQuery.trim()
    });
  };

  // 抖音提取
  const handleDouyinExtract = () => {
    navigation.navigate('DouyinExtract');
  };

  // 盲盒确认 - 跳转到独立加载页面
  const handleBlindBoxConfirm = (destination) => {
    console.log('盲盒确认:', destination.name);
    setBlindBoxVisible(false);
    navigation.navigate('Generating', {
      destination: destination.name
    });
  };

  // 点击热门城市 - 跳转到独立加载页面
  const handleCityPress = (cityName) => {
    console.log('点击城市:', cityName);
    navigation.navigate('Generating', {
      destination: cityName
    });
  };

  // 点击推荐攻略 - 跳转到独立加载页面
  const handleRecommendPress = (destination) => {
    console.log('点击推荐:', destination);
    navigation.navigate('Generating', {
      destination: destination
    });
  };

  // 热门城市数据
  const hotCities = [
    { 
      name: '大理', 
      // 修改前: image: 'https://...'
      // 修改后:
      image: require('../picture/dali.jpg') 
    },
    { 
      name: '三亚', 
      image: require('../picture/sanya.jpg') 
    },
    { 
      name: '成都', 
      image: require('../picture/chengdu.jpg') 
    },
    { 
      name: '西安', 
      image: require('../picture/xian.jpg') 
    },
    { 
      name: '厦门', 
      image: require('../picture/xiamen.jpg') 
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 头部 */}
        <View style={styles.header}>
          <Text style={styles.title}>✈️ 旅行规划师</Text>
          <Searchbar
            placeholder="搜索目的地，生成攻略"
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={handleSearch}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
          />
        </View>

        {/* 功能卡片区 */}
        <View style={styles.cardsRow}>
          {/* 盲盒旅游 */}
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => setBlindBoxVisible(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.cardInner, { backgroundColor: '#FFF5F5' }]}>
              <Text style={styles.cardIcon}>🎁</Text>
              <Text style={styles.cardTitle}>盲盒旅游</Text>
              <Text style={styles.cardDesc}>随机发现惊喜</Text>
            </View>
          </TouchableOpacity>

          {/* 抖音提取 */}
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={handleDouyinExtract}
            activeOpacity={0.8}
          >
            <View style={[styles.cardInner, { backgroundColor: '#F5F5FF' }]}>
              <Text style={styles.cardIcon}>🎬</Text>
              <Text style={styles.cardTitle}>抖音提取</Text>
              <Text style={styles.cardDesc}>一键生成攻略</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 热门目的地 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 热门目的地</Text>
            {/* <TouchableOpacity>
              <Text style={styles.moreText}>更多 &gt;</Text>
            </TouchableOpacity> */}
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cityList}
          >
            {hotCities.map((city, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.cityCard}
                onPress={() => handleCityPress(city.name)}
                activeOpacity={0.8}
              >
                <Image source={city.image} style={styles.cityImage} />
                <View style={styles.cityNameContainer}>
                  <Text style={styles.cityName}>{city.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 推荐攻略 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📍 推荐攻略</Text>
          </View>
          
          <TouchableOpacity onPress={() => handleRecommendPress('大理')}>
            <Card style={styles.recommendCard}>
              <Card.Content style={styles.recommendContent}>
                <View style={styles.recommendLeft}>
                  <Text style={styles.recommendTitle}>大理5日深度游</Text>
                  <Text style={styles.recommendInfo}>⏱ 5天4晚 · 💰 2500元起</Text>
                  <View style={styles.tagRow}>
                    <View style={styles.tag}><Text style={styles.tagText}>洱海</Text></View>
                    <View style={styles.tag}><Text style={styles.tagText}>古城</Text></View>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#ccc" />
              </Card.Content>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleRecommendPress('成都')}>
            <Card style={styles.recommendCard}>
              <Card.Content style={styles.recommendContent}>
                <View style={styles.recommendLeft}>
                  <Text style={styles.recommendTitle}>成都3日美食之旅</Text>
                  <Text style={styles.recommendInfo}>⏱ 3天2晚 · 💰 1800元起</Text>
                  <View style={styles.tagRow}>
                    <View style={styles.tag}><Text style={styles.tagText}>火锅</Text></View>
                    <View style={styles.tag}><Text style={styles.tagText}>熊猫</Text></View>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#ccc" />
              </Card.Content>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleRecommendPress('三亚')}>
            <Card style={styles.recommendCard}>
              <Card.Content style={styles.recommendContent}>
                <View style={styles.recommendLeft}>
                  <Text style={styles.recommendTitle}>三亚4日海岛度假</Text>
                  <Text style={styles.recommendInfo}>⏱ 4天3晚 · 💰 3500元起</Text>
                  <View style={styles.tagRow}>
                    <View style={styles.tag}><Text style={styles.tagText}>海滩</Text></View>
                    <View style={styles.tag}><Text style={styles.tagText}>潜水</Text></View>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#ccc" />
              </Card.Content>
            </Card>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* 盲盒弹窗 */}
      <BlindBoxModal
        visible={blindBoxVisible}
        onClose={() => setBlindBoxVisible(false)}
        onConfirm={handleBlindBoxConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#FF6B6B',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchBar: {
    borderRadius: 25,
    elevation: 0,
    backgroundColor: '#fff',
  },
  searchInput: {
    fontSize: 14,
  },
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -10,
  },
  featureCard: {
    flex: 1,
    marginHorizontal: 6,
  },
  cardInner: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  moreText: {
    fontSize: 14,
    color: '#FF6B6B',
  },
  cityList: {
    paddingRight: 16,
  },
  cityCard: {
    width: 120,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cityImage: {
    width: '100%',
    height: 80,
    backgroundColor: '#f0f0f0',
  },
  cityNameContainer: {
    padding: 10,
    alignItems: 'center',
  },
  cityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  recommendCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  recommendContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommendLeft: {
    flex: 1,
  },
  recommendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recommendInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#FF6B6B',
  },
  bottomSpace: {
    height: 20,
  },
});